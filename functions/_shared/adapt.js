export function injectEnv(env) {
  if (!env) return;
  globalThis.process = globalThis.process || { env: {} };
  globalThis.process.env = globalThis.process.env || {};
  for (const [k, v] of Object.entries(env)) {
    if (v == null || typeof v === "object") continue;
    globalThis.process.env[k] = String(v);
  }
}

export async function toEvent(context) {
  injectEnv(context.env);
  const request = context.request;
  const url = new URL(request.url);
  const headers = Object.fromEntries(request.headers);
  const qs = Object.fromEntries(url.searchParams);
  if (context.params) {
    for (const [k, v] of Object.entries(context.params)) {
      if (qs[k] != null) continue;
      qs[k] = Array.isArray(v) ? v.filter(Boolean).join("/") : String(v || "");
    }
  }
  let body = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text();
  }
  return {
    httpMethod: request.method,
    headers: {
      ...headers,
      host: url.host,
      "x-forwarded-host": url.host,
      "x-forwarded-proto": url.protocol.replace(":", "")
    },
    queryStringParameters: qs,
    body,
    path: url.pathname,
    rawUrl: url.href
  };
}

export function fromResult(out) {
  const headers = new Headers();
  const h = out.headers || {};
  for (const [k, v] of Object.entries(h)) {
    if (v == null) continue;
    headers.set(k, String(v));
  }
  return new Response(out.body || "", { status: out.statusCode || 200, headers });
}

export function pagesHandler(handler) {
  return async (context) => {
    const event = await toEvent(context);
    const out = await handler(event);
    return fromResult(out);
  };
}
