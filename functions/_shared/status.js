import { json, botToken, googleReady, publicOrigin } from "./auth.js";
import { hmsReady } from "./hms.js";
import { vdoReady } from "./vdocipher.js";

export async function handler() {
  return json({
    ok: true,
    appUrl: publicOrigin(),
    google: googleReady(),
    facebook: false,
    telegram: Boolean(botToken()),
    hms: hmsReady(),
    vdocipher: vdoReady()
  });
}
