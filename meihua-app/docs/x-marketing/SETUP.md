# StarAsk X Marketing — Setup Guide

## Required Vercel env vars

- X_MARKETING_SECRET
- X_API_KEY
- X_API_SECRET
- X_ACCESS_TOKEN
- X_ACCESS_TOKEN_SECRET
- X_BEARER_TOKEN

## Added API routes

- /api/x/post
- /api/x/reply
- /api/x/search
- /api/x/metrics

All routes require header:

Authorization: Bearer <X_MARKETING_SECRET>

## Quick tests

### metrics

```bash
curl -s https://meihua-app.vercel.app/api/x/metrics \
  -H "Authorization: Bearer $X_MARKETING_SECRET"
```

### post

```bash
curl -s -X POST https://meihua-app.vercel.app/api/x/post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $X_MARKETING_SECRET" \
  -d '{"text":"test from api"}'
```
