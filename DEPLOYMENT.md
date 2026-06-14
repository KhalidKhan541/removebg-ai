# Deployment Guide — RemoveBG AI on Cloudflare Pages

Step-by-step guide to deploy RemoveBG AI to Cloudflare Pages with KV analytics.

---

## Prerequisites

Install these before starting:

### 1. Node.js (v18+)

```bash
# Check version
node --version  # Should be v18 or higher
```

Download from [nodejs.org](https://nodejs.org/) if not installed.

### 2. Wrangler CLI

```bash
npm install -g wrangler

# Verify installation
wrangler --version
```

### 3. Cloudflare Account

Sign up at [dash.cloudflare.com](https://dash.cloudflare.com/sign-up) (free tier works).

### 4. Git (optional, for GitHub integration)

```bash
git --version
```

---

## Step 1: Clone / Set Up the Project

```bash
git clone https://github.com/your-username/removebg-ai.git
cd removebg-ai
```

Or if you have the files locally, navigate to the project directory:

```bash
cd path/to/removebg-ai
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This installs React, Vite, @imgly/background-removal, Tailwind CSS, and all other dependencies.

---

## Step 3: Authenticate with Cloudflare

```bash
wrangler login
```

This opens a browser window. Log in and authorize the CLI.

Verify authentication:

```bash
wrangler whoami
```

---

## Step 4: Create KV Namespaces

The app uses two KV namespaces: `ANALYTICS` for usage tracking and `RATE_LIMIT` for abuse prevention.

```bash
# Create production ANALYTICS namespace
wrangler kv namespace create ANALYTICS

# Create production RATE_LIMIT namespace
wrangler kv namespace create RATE_LIMIT

# Create preview (branch) versions
wrangler kv namespace create ANALYTICS --preview
wrangler kv namespace create RATE_LIMIT --preview
```

Each command outputs something like:

```
{binding = "ANALYTICS", id = "abc123def456"}
{binding = "ANALYTICS", id = "xyz789preview", preview_id = "xyz789preview"}
```

**Copy these IDs** — you'll need them in Step 5.

---

## Step 5: Configure wrangler.toml

Open `wrangler.toml` and replace the placeholder KV IDs with your actual IDs:

```toml
name = "removebg-ai"
pages_build_output_dir = "dist"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[[kv_namespaces]]
binding = "ANALYTICS"
id = "YOUR_ANALYTICS_KV_ID"              # ← Replace
preview_id = "YOUR_ANALYTICS_PREVIEW_ID" # ← Replace

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "YOUR_RATE_LIMIT_KV_ID"             # ← Replace
preview_id = "YOUR_RATE_LIMIT_PREVIEW_ID" # ← Replace
```

---

## Step 6: Test Locally

Before deploying, verify everything works locally with the Cloudflare runtime:

```bash
# Build the project
npm run build

# Start local dev server with KV bindings
npx wrangler pages dev dist --kv=ANALYTICS --kv=RATE_LIMIT
```

This simulates the Cloudflare Pages environment locally. The app should be available at `http://localhost:8788`.

---

## Step 7: Deploy to Cloudflare Pages

### Option A: Direct Deploy (manual)

```bash
# Build
npm run build

# Deploy to preview (branch deployment)
npm run deploy

# OR deploy directly to production
npm run deploy:prod
```

The deploy command outputs your live URL (e.g., `https://removebg-ai.pages.dev`).

### Option B: Via Wrangler (with project creation)

```bash
# First deploy creates the project
npx wrangler pages project create removebg-ai

# Deploy
npx wrangler pages deploy dist --project-name=removebg-ai
```

### Option C: GitHub Auto-Deploy (recommended)

See [Step 10](#step-10-github-integration-auto-deploy) below.

---

## Step 8: Set Up Custom Domain

### If your domain uses Cloudflare DNS:

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **removebg-ai**
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter your domain (e.g., `removebg.yourdomain.com`)
5. Click **Activate domain**

Cloudflare automatically creates the DNS record and provisions an SSL certificate. This takes 1-5 minutes.

### If your domain uses external DNS:

1. Add a CNAME record at your DNS provider:

```
Name:    removebg (or @)
Value:   removebg-ai.pages.dev
TTL:     Auto
```

2. Then follow steps 1-5 above in the Cloudflare dashboard.

### Verify

```bash
# Check DNS resolution
nslookup removebg.yourdomain.com

# Check HTTPS
curl -I https://removebg.yourdomain.com
```

---

## Step 9: Configure Headers for WASM

The `public/_headers` file is already configured. These headers are critical for `SharedArrayBuffer` (needed by the WASM runtime):

```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```

If headers are missing or incorrect, you'll see errors like:
- `SharedArrayBuffer is not defined`
- `Cannot create WASM multi-threaded runtime`

**Verify headers are present:**

```bash
curl -I https://removebg-ai.pages.dev/ | grep -i "cross-origin"
```

You should see both `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` in the response.

---

## Step 10: GitHub Integration (Auto-Deploy)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/removebg-ai.git
git push -u origin main
```

### 2. Connect to Cloudflare Pages

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **Overview**
2. Click **Create a project** → **Connect to Git**
3. Select your GitHub repository
4. Configure:
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (or leave blank)
5. Click **Save and Deploy**

### 3. Environment Variables (in Cloudflare Dashboard)

Go to **Settings** → **Environment variables** and add:

| Variable | Value |
|----------|-------|
| `NODE_VERSION` | `18` |

### 4. KV Bindings for Production

Go to **Settings** → **Functions** → **KV namespace bindings** and add:

| Binding name | KV namespace |
|-------------|--------------|
| `ANALYTICS` | Select your ANALYTICS namespace |
| `RATE_LIMIT` | Select your RATE_LIMIT namespace |

### 5. Verify Auto-Deploy

Push a change to `main`:

```bash
git commit --allow-empty -m "Test auto-deploy"
git push
```

Check the Cloudflare dashboard — a new deployment should trigger automatically.

---

## Step 11: Set Up Analytics Tracking

The app tracks events via the `/api/track` endpoint. Events are stored in KV with:

- **Individual events:** 7-day TTL
- **Daily aggregates:** 90-day TTL
- **Lifetime totals:** No expiration

### View Stats

```bash
curl https://removebg-ai.pages.dev/api/stats
```

Response:

```json
{
  "today": { "date": "2026-06-14", "count": 42, "avgProcessingTimeMs": 1850 },
  "allTime": { "totalBgRemoves": 1500, "totalEvents": 3200 },
  "cached": false
}
```

---

## Step 12: Monitor Performance

### Cloudflare Dashboard

1. Go to **Workers & Pages** → **removebg-ai** → **Analytics**
2. Check:
   - Request count
   - Error rate
   - Response time (P50, P90, P99)
   - Bandwidth usage

### Real User Monitoring

The app sends analytics events for:
- `bg_remove` — Background removal completed
- `image_upload` — Image uploaded
- `download` — Result downloaded
- `model_load` — WASM model loaded

---

## Summary of Deployed URLs

| URL | Description |
|-----|-------------|
| `https://removebg-ai.pages.dev` | Default Cloudflare Pages URL |
| `https://removebg.yourdomain.com` | Custom domain (if configured) |

---

## Common Issues

| Issue | Solution |
|-------|----------|
| `SharedArrayBuffer is not defined` | Ensure COOP/COEP headers are in `public/_headers` |
| KV binding error | Check KV IDs in `wrangler.toml` match dashboard |
| Build fails | Run `npm run build` locally first to see errors |
| Custom domain not working | Wait 5 min for SSL, check DNS propagation |
| Slow first load | WASM model downloads ~30MB on first use (cached after) |
