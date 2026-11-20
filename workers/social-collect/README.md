# bizgarh-social-collect

Cloudflare **Worker Cron** for Phase 1 YouTube Growth Tracker.

Pages Functions cannot attach Cron Triggers. This sibling Worker runs daily, walks `social:profiles:index`, calls YouTube Data API v3, and writes immutable-ish daily snaps under `social:snap:*` in the shared **`SALES`** KV namespace.

## Deploy

```bash
cd workers/social-collect
npx wrangler deploy
```

## Dashboard secrets / bindings

Workers → **bizgarh-social-collect** → Settings:

| Name | Required | Notes |
| --- | --- | --- |
| `YOUTUBE_API_KEY` | Yes | Same value as Cloudflare Pages |
| `SOCIAL_COLLECT_SECRET` | Yes | Random long string; same as Pages (for HTTP `/run` + Pages `/api/social/collect`) |
| KV `SALES` | Yes | Same namespace id as Pages (`4bf3b2ad591f4156b25009f3327810fa`) |

Cursor / agent secrets do **not** auto-apply here — set values in the Cloudflare Dashboard, then redeploy if needed.

## Cron

Default in `wrangler.toml`: `45 18 * * *` (18:45 UTC ≈ **00:15 IST**).

## Manual run

```bash
curl -X POST "https://bizgarh-social-collect.<account>.workers.dev/run" \
  -H "Authorization: Bearer $SOCIAL_COLLECT_SECRET"
```

Or via Pages (after Pages env is set):

```bash
curl -X POST "https://www.bizgarh.com/api/social/collect" \
  -H "Authorization: Bearer $SOCIAL_COLLECT_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Safety

- Writes **only** keys prefixed `social:`
- Never deletes `digest:` / `sale:` / other CRM keys
- Failed collects do not blank a prior good IST day snap
