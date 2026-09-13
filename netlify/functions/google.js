const crypto = require("crypto");
const {
  googleClientId,
  googleClientSecret,
  googleReady,
  requestOrigin,
  safeNext,
  redirect,
  readCookie,
  signTicket,
  oauthUserFromGoogle,
  setupHtml
} = require("./_auth");

function stateCookie(value, maxAge) {
  const age = maxAge == null ? 600 : maxAge;
  return `oauth_state=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}; Secure`;
}

function nextFromState(state) {
  const raw = String(state || "");
  const dot = raw.indexOf(".");
  if (dot < 1) return "index.html";
  return safeNext(raw.slice(dot + 1));
}

function fail(origin, next, message) {
  return redirect(
    `${origin}/${next}?oauth_error=${encodeURIComponent(message)}`,
    { "Set-Cookie": stateCookie("", 0) }
  );
}

async function completeGoogle(event, origin) {
  const qs = event.queryStringParameters || {};
  const state = String(qs.state || "");
  const cookieState = readCookie(event, "oauth_state");
  const next = nextFromState(state || cookieState);

  if (qs.error) return fail(origin, next, "Google login cancelled");
  if (!googleReady()) return fail(origin, next, "Google login is not connected yet");
  if (!state || !cookieState || state !== cookieState) {
    return fail(origin, next, "Google login expired. Try again.");
  }

  const code = String(qs.code || "");
  if (!code) return fail(origin, next, "Google did not return a code");

  const redirectUri = `${origin}/auth/google/callback`;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: googleClientId(),
        client_secret: googleClientSecret(),
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });
    const token = await tokenRes.json();
    if (!tokenRes.ok || !token.access_token) {
      return fail(origin, next, "Google token exchange failed");
    }

    const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: "Bearer " + token.access_token }
    });
    const info = await infoRes.json();
    const email = String(info.email || "").trim().toLowerCase();
    if (!infoRes.ok || !email) {
      return fail(origin, next, "Google did not share an email");
    }

    const user = oauthUserFromGoogle(info);
    const ticket = signTicket(user, "google");
    return redirect(
      `${origin}/${next}?oauth_ticket=${encodeURIComponent(ticket)}`,
      { "Set-Cookie": stateCookie("", 0) }
    );
  } catch {
    return fail(origin, next, "Google login failed. Try again.");
  }
}

exports.handler = async (event) => {
  const qs = event.queryStringParameters || {};
  const path = String(event.path || event.rawUrl || "");
  const origin = requestOrigin(event);
  const isCallback = qs.flow === "callback" || /\/callback/i.test(path);

  if (isCallback) return completeGoogle(event, origin);

  if (!googleReady()) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      body: setupHtml("google")
    };
  }

  const next = safeNext(qs.next);
  const csrf = crypto.randomBytes(16).toString("hex");
  const state = csrf + "." + next;
  const redir = `${origin}/auth/google/callback`;
  const url = "https://accounts.google.com/o/oauth2/v2/auth"
    + "?client_id=" + encodeURIComponent(googleClientId())
    + "&redirect_uri=" + encodeURIComponent(redir)
    + "&response_type=code"
    + "&scope=" + encodeURIComponent("openid email profile")
    + "&state=" + encodeURIComponent(state)
    + "&access_type=online"
    + "&prompt=select_account";

  return redirect(url, { "Set-Cookie": stateCookie(state) });
};
