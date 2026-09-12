$p = Join-Path $PSScriptRoot "..\js\reviews-data.js"
$t = [IO.File]::ReadAllText($p)
Write-Host $t.Substring(0, 900)
Write-Host "---COUNT---"
$n = ([regex]::Matches($t, '"name":')).Count
Write-Host "name count: $n"
Write-Host "len: $($t.Length)"
Write-Host $t.Substring($t.Length - 200)
