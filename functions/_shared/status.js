import { json, botToken, googleReady, publicOrigin } from "./auth.js";

export async function handler() {
  return json({
    ok: true,
    appUrl: publicOrigin(),
    google: googleReady(),
    facebook: false,
    telegram: Boolean(botToken())
  });
}
