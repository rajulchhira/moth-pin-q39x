const { json, botToken, publicOrigin } = require("./_auth");

exports.handler = async () => {
  return json({
    ok: true,
    appUrl: publicOrigin(),
    google: false,
    facebook: false,
    telegram: Boolean(botToken())
  });
};
