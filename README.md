# RemoveBG AI

AI-powered background removal tool that runs entirely in the browser using WebAssembly. No server-side processing needed — all image processing happens client-side for maximum privacy and speed.

## Features

- **Client-side AI processing** — Background removal via `@imgly/background-removal` (ONNX Runtime + WASM)
- **Multi-threaded WASM** — Uses `SharedArrayBuffer` for fast inference
- **Real-time preview** — See results before downloading
- **Custom backgrounds** — Solid colors, images, or transparent output
- **Drag & drop upload** — Intuitive file handling
- **Analytics dashboard** — Usage stats via Cloudflare KV
- **Rate limiting** — Protection against abuse
- **Fully private** — Images never leave the browser

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite 6 |
| Styling | Tailwind CSS 3 |
| State | Zustand 5 |
| AI Engine | `@imgly/background-removal` (ONNX + WASM) |
| Backend | Cloudflare Pages Functions |
| Storage | Cloudflare KV (analytics) |
| CI/CD | GitHub Actions → Cloudflare Pages |

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/removebg-ai.git
cd removebg-ai

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app runs at `http://localhost:5173` with COOP/COEP headers enabled (required for WASM multi-threading).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Deploy to Cloudflare Pages (preview) |
| `npm run deploy:prod` | Deploy to Cloudflare Pages (production) |

## Build

```bash
npm run build
```

Output goes to `dist/`. The build runs `tsc -b` for type checking, then `vite build` for bundling.

## Deployment to Cloudflare Pages

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full step-by-step guide.

### Quick Deploy

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create KV namespaces
wrangler kv namespace create ANALYTICS
wrangler kv namespace create RATE_LIMIT --preview

# Update wrangler.toml with the IDs from the output above

# Build and deploy
npm run build
npm run deploy:prod
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANALYTICS_KV` | Yes | KV binding for analytics data |
| `RATE_LIMIT_KV` | Yes | KV binding for rate limiting |
| `NODE_VERSION` | No | Node version for build (default: 18) |

For local development, create a `.dev.vars` file (not committed):

```bash
# .dev.vars
```

For production secrets:

```bash
echo "value" | wrangler pages secret put SECRET_KEY --project-name=removebg-ai
```

## Custom Domain

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **removebg-ai**
2. Click **Custom domains** → **Set up a custom domain**
3. Enter your domain (e.g., `removebg.yourdomain.com`)
4. If the domain uses Cloudflare DNS, the record is created automatically
5. If using external DNS, add a CNAME record pointing to `removebg-ai.pages.dev`
6. SSL certificate is provisioned automatically (takes ~5 minutes)

## Troubleshooting

### WASM not loading / COOP/COEP errors

The app requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers. These are configured in `public/_headers` and `vite.config.ts`.

If you see `SharedArrayBuffer is not defined`, ensure these headers are present in the response.

### Build fails with TypeScript errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### KV binding errors in local dev

```bash
# Start dev with KV bindings
npx wrangler pages dev dist --kv=ANALYTICS --kv=RATE_LIMIT
```

### Large model download on first use

The `@imgly/background-removal` library downloads ONNX models (~30MB) on first invocation. Subsequent uses are cached by the browser. Consider adding a loading indicator in your UI.

### Deployment fails

Check that:
- `wrangler.toml` has the correct `pages_build_output_dir`
- KV namespace IDs are correct
- You're authenticated: `wrangler whoami`

## Performance Tips

1. **Model caching** — The WASM model is cached after first download. Users pay the download cost once.
2. **Image resizing** — Large images are slower to process. Consider resizing client-side before sending to the model.
3. **KV TTL** — Analytics events expire after 7 days; daily aggregates after 90 days. Adjust in `functions/api/track.ts`.
4. **Edge caching** — Static assets are served from Cloudflare's edge network by default.
5. **WASM threads** — COOP/COEP headers enable multi-threaded inference, significantly faster than single-threaded.

## License

MIT
