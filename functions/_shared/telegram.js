import {
  botToken,
  publicOrigin,
  safeNext,
  publicPath,
  redirect,
  signTicket,
  verifyTelegram,
  oauthUserFromTelegram,
  setupHtml
} from "./auth.js";

export async function handler(event) {
  const qs = event.queryStringParameters || {};
  const path = String(event.path || "");
  const origin = publicOrigin();
  const next = safeNext(qs.next);

  const isCallback = qs.flow === "callback" || /\/callback/i.test(path) || Boolean(qs.hash);
  if (isCallback) {
    if (!qs.hash || !qs.id) {
      return redirect(`${origin}${publicPath(next)}?oauth_error=${encodeURIComponent("Telegram login cancelled")}`);
    }
    if (!verifyTelegram(qs)) {
      return redirect(`${origin}${publicPath(next)}?oauth_error=${encodeURIComponent("Telegram signature was invalid")}`);
    }
    const user = oauthUserFromTelegram(qs);
    const ticket = signTicket(user, "telegram");
    return redirect(`${origin}${publicPath(next)}?oauth_ticket=${encodeURIComponent(ticket)}`);
  }

  if (!botToken()) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      body: setupHtml()
    };
  }

  const botId = botToken().split(":")[0];
  const returnTo = `${origin}/auth/telegram/callback?next=${encodeURIComponent(next)}`;
  const url = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(origin)}&request_access=write&return_to=${encodeURIComponent(returnTo)}`;
  return redirect(url);
}
