const { json, botToken, googleReady, publicOrigin } = require("./_auth");

exports.handler = async () => {
  return json({
    ok: true,
    appUrl: publicOrigin(),
    google: googleReady(),
    facebook: false,
    telegram: Boolean(botToken())
  });
};
