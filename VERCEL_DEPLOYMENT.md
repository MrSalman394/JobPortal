# Vercel Deployment

This project is configured for Vercel with:

- Frontend output: `dist/public`
- Build command: `npm run build`
- API entry: `api/index.ts`
- API rewrite: `/api/*` -> Express serverless handler
- Frontend fallback: all non-API routes -> `index.html`

## Environment Variables

Add these in Vercel Project Settings -> Environment Variables:

```text
DATABASE_URL=your Neon connection string
SESSION_SECRET=your existing session secret, or a new long random secret
```

`VITE_API_URL` is present in the local `.env`, but it is not currently used by the app.

## Deploy Steps

1. Push this project to GitHub.
2. In Vercel, choose Add New Project and import the GitHub repo.
3. Keep the framework preset as Other if Vercel does not auto-detect it correctly.
4. Use these settings:
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`
5. Add the environment variables above for Production, Preview, and Development as needed.
6. Deploy.

After deployment, visit `/api/stats` on the deployed domain to confirm the API can reach Neon.
