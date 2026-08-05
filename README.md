# LATEXF

Angular 22 + Angular Material + Capacitor Android app for rubber growers.

## Run in the browser

```bash
npm install
npm start
```

The start script includes a local development compatibility shim because the installed environment is Node 24.13.x and Angular CLI 22 currently requires 24.15.x. Updating Node remains recommended for production builds.

The browser uses `/api/v1` through the local Angular proxy. The Android app uses
`10.0.2.2:8080` by default. Both can be configured through `public/config.js`:

```js
window.__LATEXF_CONFIG__ = {
  apiBaseUrl: 'https://your-railway-service.up.railway.app'
};
```

For the current Render backend, use `https://latexb.onrender.com`.

For a Cloudflare Worker deployment, run `npx wrangler deploy` after the build.
The committed `wrangler.jsonc` points Wrangler to the Angular browser output and
enables SPA fallback routing.

The value may be the Railway origin or the complete `/api/v1` URL. Do not put
credentials or secrets in this file; it is public browser code.

## Deploy to Cloudflare Pages

Configure the Pages project with:

- Build command: `npm run build`
- Output directory: `dist/untitled/browser`
- Node.js version: `22` or newer

Before deploying, set `public/config.js` to the Railway backend origin, or use
the same file as a deployment-specific runtime asset. The included
`public/_redirects` file keeps Angular routes working on refresh.

The Railway API must allow the Cloudflare Pages domain in CORS and serve HTTPS.
The frontend cannot safely proxy or hide backend secrets; authentication and
payment credentials belong on Railway.

## Run on Android

Start the backend on port `8080`, then:

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

The Android emulator calls the host machine through `10.0.2.2`. For a physical
device or production APK, set `apiBaseUrl` in `public/config.js` to the Railway
HTTPS origin before `npm run build` and `npx cap sync android`. The backend must
allow the app origin and cleartext traffic should only be used for local HTTP.

## Backend assumptions

The app uses the supplied endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /user/profile`
- `GET /payment/plan`
- `POST /payment/create-order` with `{ "gateway": "RAZORPAY" }`
- `POST /payment/submit`
- `GET /payment/status`
- `POST /payment/admin/verify` (admin-only API method)
- `GET /price/today`
- `GET /price/recent-and-prediction`
- `POST /auth/logout`

The login response should contain a session ID (`sessionId`, `data.sessionId`, or `session.id`). It is sent on protected calls as `X-Session-Id`.

The supplied API list does not include a subscription/payment endpoint. The current payment screen generates the configured UPI QR and records “payment submitted” locally for review; it does not activate a subscription. To make payment fully live, add an endpoint such as `POST /subscription/subscribe` or a payment-provider flow, then replace `markPaymentDone()` in `src/app/app.ts` with that API call. Subscription and `smsAlertEnabled` are read from the profile response.
