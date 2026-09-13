const { json, readTicket } = require("./_auth");

exports.handler = async (event) => {
  const qs = event.queryStringParameters || {};
  const path = String(event.path || event.rawUrl || "");
  let id = qs.ticket || "";
  if (!id) {
    const marker = "/ticket/";
    const i = path.lastIndexOf(marker);
    if (i >= 0) id = path.slice(i + marker.length).split("?")[0];
  }
  try {
    id = decodeURIComponent(id);
  } catch {
    id = String(id || "");
  }
  const row = readTicket(id);
  if (!row) return json({ error: "Login ticket expired. Try again." }, 400);
  return json({ user: row.user, provider: row.provider || "telegram" });
};
