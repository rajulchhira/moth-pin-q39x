# Bizgarh OAuth + static file server (Google / Facebook / Telegram)
# Run: powershell -ExecutionPolicy Bypass -File oauth-server.ps1
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function Import-DotEnv {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return }
  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    $i = $line.IndexOf("=")
    if ($i -lt 1) { return }
    $name = $line.Substring(0, $i).Trim()
    $val = $line.Substring($i + 1).Trim().Trim('"').Trim("'")
    Set-Item -Path "Env:$name" -Value $val
  }
}
Import-DotEnv (Join-Path $root ".env")

$script:AppUrl = if ($env:APP_URL) { $env:APP_URL.TrimEnd("/") } else { "http://127.0.0.1:5500" }
$script:Secret = if ($env:SESSION_SECRET) { $env:SESSION_SECRET } else { "dev-secret" }
$script:Tickets = @{}
$script:DataDir = Join-Path $root "data"
if (-not (Test-Path $script:DataDir)) { New-Item -ItemType Directory -Path $script:DataDir | Out-Null }
$script:UsersFile = Join-Path $script:DataDir "users.json"

function Get-HmacHex([string]$text, [byte[]]$keyBytes) {
  $hmac = [System.Security.Cryptography.HMACSHA256]::new($keyBytes)
  try {
    return ([BitConverter]::ToString($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($text)))).Replace("-", "").ToLowerInvariant()
  } finally { $hmac.Dispose() }
}
function Get-SecretBytes { [Text.Encoding]::UTF8.GetBytes($script:Secret) }
function New-Id { [guid]::NewGuid().ToString("N") }
function UrlEncode([string]$s) { [Uri]::EscapeDataString($s) }
function HtmlEnc([string]$s) {
  if ($null -eq $s) { return "" }
  return [System.Net.WebUtility]::HtmlEncode($s)
}

function Read-Users {
  if (-not (Test-Path $script:UsersFile)) { return @() }
  try {
    $raw = Get-Content $script:UsersFile -Raw -ErrorAction Stop
    if (-not $raw) { return @() }
    $parsed = $raw | ConvertFrom-Json
    if ($parsed -is [System.Array]) { return @($parsed) }
    if ($null -eq $parsed) { return @() }
    return @($parsed)
  } catch { return @() }
}
function Save-Users($users) {
  ($users | ConvertTo-Json -Depth 6) | Set-Content -Path $script:UsersFile -Encoding UTF8
}
function Upsert-OAuthUser($profile) {
  $users = @(Read-Users)
  $email = [string]$profile.email
  $hit = $users | Where-Object { $_.email -and $_.email.ToLower() -eq $email.ToLower() } | Select-Object -First 1
  $now = [DateTime]::UtcNow.ToString("o")
  if ($hit) {
    $prov = @($hit.providers)
    if ($prov -notcontains $profile.provider) { $prov += $profile.provider }
    $hit.name = $profile.name
    $hit.providers = $prov
    $hit.providerId = $profile.providerId
    $hit.emailVerified = $true
    $hit.status = if ($hit.status) { $hit.status } else { "active" }
    if (-not $hit.created) { $hit.created = $now }
  } else {
    $hit = [pscustomobject]@{
      name          = $profile.name
      email         = $email
      password      = ""
      providers     = @($profile.provider)
      providerId    = $profile.providerId
      emailVerified = $true
      status        = "active"
      created       = $now
      referredBy    = ""
      referralSource = "oauth_" + $profile.provider
    }
    $users += $hit
  }
  Save-Users $users
  return $hit
}

function Provider-Ready([string]$p) {
  switch ($p) {
    "google" { return [bool]($env:GOOGLE_CLIENT_ID -and $env:GOOGLE_CLIENT_SECRET) }
    "facebook" { return [bool]($env:FACEBOOK_APP_ID -and $env:FACEBOOK_APP_SECRET) }
    "telegram" { return [bool]($env:TELEGRAM_BOT_TOKEN -and $env:TELEGRAM_BOT_USERNAME) }
    default { return $false }
  }
}

function Send-Bytes($ctx, [int]$status, [string]$type, [byte[]]$bytes, $headers) {
  $ctx.Response.StatusCode = $status
  $ctx.Response.ContentType = $type
  $ctx.Response.Headers.Add("Cache-Control", "no-store")
  if ($headers) {
    foreach ($k in $headers.Keys) { $ctx.Response.Headers.Add($k, [string]$headers[$k]) }
  }
  $ctx.Response.ContentLength64 = $bytes.Length
  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $ctx.Response.Close()
}
function Send-Text($ctx, [int]$status, [string]$type, [string]$text, $headers) {
  Send-Bytes $ctx $status $type ([Text.Encoding]::UTF8.GetBytes($text)) $headers
}
function Send-Json($ctx, $obj, [int]$status = 200) {
  Send-Text $ctx $status "application/json; charset=utf-8" ($obj | ConvertTo-Json -Depth 6 -Compress)
}
function Send-Redirect($ctx, [string]$url, $headers) {
  $ctx.Response.StatusCode = 302
  $ctx.Response.RedirectLocation = $url
  $ctx.Response.Headers.Add("Cache-Control", "no-store")
  if ($headers) {
    foreach ($k in $headers.Keys) { $ctx.Response.Headers.Add($k, [string]$headers[$k]) }
  }
  $ctx.Response.Close()
}

function Safe-Next([string]$n) {
  if ([string]::IsNullOrWhiteSpace($n)) { return "index.html" }
  $n = $n.Trim().TrimStart("/")
  $cut = $n.IndexOfAny(@([char]'?', [char]'#'))
  if ($cut -ge 0) { $n = $n.Substring(0, $cut) }
  if ($n -eq "index") { return "index.html" }
  if ($n -notmatch '\.html$') { $n = "$n.html" }
  if ($n -notmatch '^[A-Za-z0-9._-]+\.html$') { return "index.html" }
  return $n
}
function Public-Path([string]$n) {
  $page = Safe-Next $n
  if ($page -eq "index.html") { return "/" }
  return "/" + ($page -replace '\.html$','')
}
function Read-Cookie($ctx, [string]$name) {
  $h = $ctx.Request.Headers["Cookie"]
  if (-not $h) { return $null }
  foreach ($part in $h.Split(";")) {
    $kv = $part.Trim()
    $eq = $kv.IndexOf("=")
    if ($eq -lt 1) { continue }
    if ($kv.Substring(0, $eq) -eq $name) { return $kv.Substring($eq + 1) }
  }
  return $null
}

function New-SessionCookie([string]$email) {
  $exp = [DateTimeOffset]::UtcNow.AddDays(14).ToUnixTimeSeconds()
  $payload = $email + "|" + $exp
  $sig = Get-HmacHex $payload (Get-SecretBytes)
  $token = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($payload + "|" + $sig))
  return "ts_session=$token; Path=/; HttpOnly; SameSite=Lax; Max-Age=1209600"
}
function Read-SessionEmail($ctx) {
  $raw = Read-Cookie $ctx "ts_session"
  if (-not $raw) { return $null }
  try {
    $decoded = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($raw))
    $parts = $decoded.Split("|")
    if ($parts.Count -ne 3) { return $null }
    $email, $exp, $sig = $parts
    if ([int64]$exp -lt [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()) { return $null }
    $expect = Get-HmacHex ($email + "|" + $exp) (Get-SecretBytes)
    if ($sig -ne $expect) { return $null }
    return $email
  } catch { return $null }
}

function User-Dto($u) {
  if (-not $u) { return $null }
  $provs = @($u.providers)
  return [pscustomobject]@{
    name          = $u.name
    email         = $u.email
    password      = ""
    providers     = $provs
    providerId    = $u.providerId
    emailVerified = $true
    status        = if ($u.status) { $u.status } else { "active" }
    created       = $u.created
    referredBy    = $u.referredBy
  }
}

function Issue-Ticket($ctx, $user, [string]$provider, [string]$next) {
  $id = New-Id
  $script:Tickets[$id] = @{
    user     = (User-Dto $user)
    provider = $provider
    exp      = [DateTime]::UtcNow.AddMinutes(3)
  }
  $page = Public-Path $next
  $cookie = New-SessionCookie $user.email
  Send-Redirect $ctx "$($script:AppUrl)${page}?oauth_ticket=$id" @{ "Set-Cookie" = $cookie }
}

function Setup-Html([string]$provider) {
  $g = if (Provider-Ready "google") { "Ready" } else { "Missing keys" }
  $f = if (Provider-Ready "facebook") { "Ready" } else { "Missing keys" }
  $t = if (Provider-Ready "telegram") { "Ready" } else { "Missing keys" }
  $need = switch ($provider) {
    "google" { "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env" }
    "facebook" { "FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in .env" }
    "telegram" { "TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_USERNAME in .env" }
    default { "OAuth keys in .env" }
  }
  $title = $provider.Substring(0,1).ToUpper() + $provider.Substring(1)
  $gc = if (Provider-Ready "google") { "ok" } else { "no" }
  $fc = if (Provider-Ready "facebook") { "ok" } else { "no" }
  $tc = if (Provider-Ready "telegram") { "ok" } else { "no" }
  return @"
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Connect $title | Bizgarh</title>
<style>
body{font-family:Nunito,Arial,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:40px}
.card{max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px}
h1{margin:0 0 8px} .muted{color:#64748b}
code,pre{background:#f1f5f9;padding:2px 6px;border-radius:6px;font-size:13px}
li{margin:8px 0} .ok{color:#047857} .no{color:#b91c1c}
</style></head><body><div class="card">
<h1>Connect $title login</h1>
<p class="muted">Clicking the button sent you here because $need are not set yet. Add them, restart oauth-server.ps1, then click again. Google / Facebook / Telegram will sign the user in directly.</p>
<p>Redirect URIs to paste in the developer console:</p>
<pre>Google    $($script:AppUrl)/auth/google/callback
Facebook $($script:AppUrl)/auth/facebook/callback
Telegram $($script:AppUrl)/auth/telegram/callback
Origin   $($script:AppUrl)</pre>
<ul>
<li>Google: <span class="$gc">$g</span> - Cloud Console, Credentials, Web client</li>
<li>Facebook: <span class="$fc">$f</span> - developers.facebook.com, Facebook Login</li>
<li>Telegram: <span class="$tc">$t</span> - BotFather /newbot then /setdomain</li>
</ul>
<p><a href="/">Back to Bizgarh</a></p>
</div></body></html>
"@
}

function Fail-OAuth($ctx, [string]$message, [string]$next) {
  $page = Public-Path $next
  Send-Redirect $ctx "$($script:AppUrl)${page}?oauth_error=$(UrlEncode $message)"
}

function Begin-OAuth($ctx, [string]$provider) {
  $next = Safe-Next $ctx.Request.QueryString["next"]
  if (-not (Provider-Ready $provider)) {
    Send-Text $ctx 200 "text/html; charset=utf-8" (Setup-Html $provider)
    return
  }
  $csrf = New-Id
  $state = $csrf + "." + $next
  $cookie = "oauth_state=$state; Path=/; HttpOnly; SameSite=Lax; Max-Age=600"
  $redirGoogle = "$($script:AppUrl)/auth/google/callback"
  $redirFb = "$($script:AppUrl)/auth/facebook/callback"
  if ($provider -eq "google") {
    $url = "https://accounts.google.com/o/oauth2/v2/auth?client_id=$(UrlEncode $env:GOOGLE_CLIENT_ID)&redirect_uri=$(UrlEncode $redirGoogle)&response_type=code&scope=openid%20email%20profile&state=$(UrlEncode $state)&access_type=online&prompt=select_account"
    Send-Redirect $ctx $url @{ "Set-Cookie" = $cookie }
    return
  }
  if ($provider -eq "facebook") {
    $url = "https://www.facebook.com/v21.0/dialog/oauth?client_id=$(UrlEncode $env:FACEBOOK_APP_ID)&redirect_uri=$(UrlEncode $redirFb)&state=$(UrlEncode $state)&scope=email,public_profile"
    Send-Redirect $ctx $url @{ "Set-Cookie" = $cookie }
    return
  }
  if ($provider -eq "telegram") {
    $botId = $env:TELEGRAM_BOT_TOKEN.Split(":")[0]
    $origin = $script:AppUrl
    $returnTo = "$($script:AppUrl)/auth/telegram/callback?next=$(UrlEncode $next)"
    $url = "https://oauth.telegram.org/auth?bot_id=$botId&origin=$(UrlEncode $origin)&request_access=write&return_to=$(UrlEncode $returnTo)"
    Send-Redirect $ctx $url @{ "Set-Cookie" = $cookie }
    return
  }
  Fail-OAuth $ctx "Unknown provider" $next
}

function Read-State($ctx) {
  $state = $ctx.Request.QueryString["state"]
  $cookie = Read-Cookie $ctx "oauth_state"
  if (-not $state -or -not $cookie) { return $null }
  if ($state -ne $cookie) { return $null }
  $dot = $state.IndexOf(".")
  if ($dot -lt 1) { return $null }
  return @{ csrf = $state.Substring(0, $dot); next = (Safe-Next $state.Substring($dot + 1)) }
}

function Complete-Google($ctx) {
  $st = Read-State $ctx
  $next = if ($st) { $st.next } else { "index.html" }
  if ($ctx.Request.QueryString["error"]) { Fail-OAuth $ctx "Google login cancelled" $next; return }
  if (-not $st) { Fail-OAuth $ctx "Google login expired. Try again." $next; return }
  $code = $ctx.Request.QueryString["code"]
  if (-not $code) { Fail-OAuth $ctx "Google did not return a code" $next; return }
  try {
    $token = Invoke-RestMethod -Method POST -Uri "https://oauth2.googleapis.com/token" -ContentType "application/x-www-form-urlencoded" -Body @{
      code          = $code
      client_id     = $env:GOOGLE_CLIENT_ID
      client_secret = $env:GOOGLE_CLIENT_SECRET
      redirect_uri  = "$($script:AppUrl)/auth/google/callback"
      grant_type    = "authorization_code"
    }
    $info = Invoke-RestMethod -Uri "https://www.googleapis.com/oauth2/v3/userinfo" -Headers @{ Authorization = "Bearer $($token.access_token)" }
    $email = [string]$info.email
    $name = if ($info.name) { [string]$info.name } else { $email }
    if (-not $email) { Fail-OAuth $ctx "Google did not share an email" $next; return }
    $user = Upsert-OAuthUser @{ name = $name; email = $email.ToLower(); provider = "google"; providerId = [string]$info.sub }
    Issue-Ticket $ctx $user "google" $next
  } catch {
    Fail-OAuth $ctx "Google token exchange failed" $next
  }
}

function Complete-Facebook($ctx) {
  $st = Read-State $ctx
  $next = if ($st) { $st.next } else { "index.html" }
  if ($ctx.Request.QueryString["error"]) { Fail-OAuth $ctx "Facebook login cancelled" $next; return }
  if (-not $st) { Fail-OAuth $ctx "Facebook login expired. Try again." $next; return }
  $code = $ctx.Request.QueryString["code"]
  if (-not $code) { Fail-OAuth $ctx "Facebook did not return a code" $next; return }
  try {
    $redir = "$($script:AppUrl)/auth/facebook/callback"
    $tokenUrl = "https://graph.facebook.com/v21.0/oauth/access_token?client_id=$(UrlEncode $env:FACEBOOK_APP_ID)&redirect_uri=$(UrlEncode $redir)&client_secret=$(UrlEncode $env:FACEBOOK_APP_SECRET)&code=$(UrlEncode $code)"
    $token = Invoke-RestMethod -Uri $tokenUrl
    $info = Invoke-RestMethod -Uri "https://graph.facebook.com/me?fields=id,name,email&access_token=$(UrlEncode $token.access_token)"
    $id = [string]$info.id
    $email = if ($info.email) { [string]$info.email } else { "$id@facebook.user" }
    $name = if ($info.name) { [string]$info.name } else { "Facebook user" }
    $user = Upsert-OAuthUser @{ name = $name; email = $email.ToLower(); provider = "facebook"; providerId = $id }
    Issue-Ticket $ctx $user "facebook" $next
  } catch {
    Fail-OAuth $ctx "Facebook token exchange failed" $next
  }
}

function Test-TelegramHash($qs) {
  $hash = [string]$qs["hash"]
  if (-not $hash) { return $false }
  $keys = @()
  foreach ($k in $qs.AllKeys) { if ($k -and $k -ne "hash" -and $k -ne "next") { $keys += $k } }
  $keys = $keys | Sort-Object
  $lines = foreach ($k in $keys) { "$k=$($qs[$k])" }
  $check = ($lines -join "`n")
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    $secret = $sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($env:TELEGRAM_BOT_TOKEN))
  } finally { $sha.Dispose() }
  $calc = Get-HmacHex $check $secret
  return ($calc -eq $hash.ToLowerInvariant())
}

function Complete-Telegram($ctx) {
  $next = Safe-Next $ctx.Request.QueryString["next"]
  $qs = $ctx.Request.QueryString
  if (-not $qs["hash"] -or -not $qs["id"]) { Fail-OAuth $ctx "Telegram login cancelled" $next; return }
  if (-not (Test-TelegramHash $qs)) { Fail-OAuth $ctx "Telegram signature was invalid" $next; return }
  $id = [string]$qs["id"]
  $handle = [string]$qs["username"]
  $name = (@($qs["first_name"], $qs["last_name"]) | Where-Object { $_ }) -join " "
  if (-not $name) { $name = if ($handle) { $handle } else { "Telegram user" } }
  $email = if ($handle) { ($handle.TrimStart("@").ToLower() + "@telegram.user") } else { ($id + "@telegram.user") }
  $user = Upsert-OAuthUser @{ name = $name; email = $email; provider = "telegram"; providerId = $id }
  Issue-Ticket $ctx $user "telegram" $next
}

function Handle-Api($ctx, [string]$path) {
  if ($path -eq "/api/auth/status") {
    Send-Json $ctx @{
      ok       = $true
      appUrl   = $script:AppUrl
      google   = [bool](Provider-Ready "google")
      facebook = [bool](Provider-Ready "facebook")
      telegram = [bool](Provider-Ready "telegram")
    }
    return
  }
  if ($path -eq "/api/me") {
    $email = Read-SessionEmail $ctx
    if (-not $email) { Send-Json $ctx @{ user = $null } 401; return }
    $u = @(Read-Users) | Where-Object { $_.email -and $_.email.ToLower() -eq $email.ToLower() } | Select-Object -First 1
    Send-Json $ctx @{ user = (User-Dto $u) }
    return
  }
  if ($path -eq "/api/auth/logout") {
    Send-Json $ctx @{ ok = $true } 200
    return
  }
  if ($path -like "/api/auth/ticket/*") {
    $id = $path.Substring("/api/auth/ticket/".Length)
    $row = $script:Tickets[$id]
    if (-not $row -or $row.exp -lt [DateTime]::UtcNow) {
      $script:Tickets.Remove($id) | Out-Null
      Send-Json $ctx @{ error = "Login ticket expired. Click Google again." } 400
      return
    }
    $script:Tickets.Remove($id) | Out-Null
    Send-Json $ctx @{ user = $row.user; provider = $row.provider }
    return
  }
  Send-Json $ctx @{ error = "Not found" } 404
}

function Handle-Logout-Cookie($ctx) {
  # overwrite session cookie
  $headers = @{ "Set-Cookie" = "ts_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0" }
  Send-Text $ctx 200 "application/json; charset=utf-8" '{"ok":true}' $headers
}

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".woff2"= "font/woff2"
  ".json" = "application/json"
  ".ico"  = "image/x-icon"
  ".webp" = "image/webp"
  ".mp4"  = "video/mp4"
}

function Serve-Static($ctx, [string]$path) {
  $query = $ctx.Request.Url.Query
  if ($path -eq "/index" -or $path -eq "/index.html") {
    Send-Redirect $ctx ($script:AppUrl + "/" + $query)
    return
  }
  if ($path -match '\.html$') {
    $pretty = $path -replace '\.html$',''
    Send-Redirect $ctx ($script:AppUrl + $pretty + $query)
    return
  }
  if ($path -eq "/") { $path = "/index.html" }
  elseif ($path -notmatch '\.[A-Za-z0-9]+$') { $path = "$path.html" }
  $rel = $path.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)
  $file = [IO.Path]::GetFullPath((Join-Path $root $rel))
  $rootFull = [IO.Path]::GetFullPath($root)
  if (-not $file.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) {
    Send-Text $ctx 403 "text/plain" "Forbidden"
    return
  }
  if (-not (Test-Path $file -PathType Leaf)) {
    Send-Text $ctx 404 "text/plain" "Not found"
    return
  }
  $ext = [IO.Path]::GetExtension($file).ToLowerInvariant()
  $type = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
  $bytes = [IO.File]::ReadAllBytes($file)
  Send-Bytes $ctx 200 $type $bytes
}

# free port 5500 if the old static listener is still bound
try {
  Get-NetTCPConnection -LocalPort 5500 -ErrorAction SilentlyContinue | ForEach-Object {
    try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } catch {}
  }
} catch {}
Start-Sleep -Milliseconds 400

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:5500/")
try { $listener.Start() } catch {
  Write-Host "Could not bind http://127.0.0.1:5500/ - close the old server first."
  throw
}
Write-Host "Bizgarh OAuth server  $($script:AppUrl)/"
Write-Host ("Google={0}  Facebook={1}  Telegram={2}" -f (Provider-Ready "google"), (Provider-Ready "facebook"), (Provider-Ready "telegram"))

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if ($path -eq "/auth/google") { Begin-OAuth $ctx "google"; continue }
    if ($path -eq "/auth/google/callback") { Complete-Google $ctx; continue }
    if ($path -eq "/auth/facebook") { Begin-OAuth $ctx "facebook"; continue }
    if ($path -eq "/auth/facebook/callback") { Complete-Facebook $ctx; continue }
    if ($path -eq "/auth/telegram") { Begin-OAuth $ctx "telegram"; continue }
    if ($path -eq "/auth/telegram/callback") { Complete-Telegram $ctx; continue }
    if ($path -eq "/api/auth/logout") { Handle-Logout-Cookie $ctx; continue }
    if ($path.StartsWith("/api/")) { Handle-Api $ctx $path; continue }
    Serve-Static $ctx $path
  } catch {
    Write-Host $_
    try { $ctx.Response.StatusCode = 500; $ctx.Response.Close() } catch {}
  }
}
