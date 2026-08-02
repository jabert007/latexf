# LATEXF

Angular 22 + Angular Material + Capacitor Android app for rubber growers.

## Run in the browser

```bash
npm install
npm start
```

The start script includes a local development compatibility shim because the installed environment is Node 24.13.x and Angular CLI 22 currently requires 24.15.x. Updating Node remains recommended for production builds.

The browser calls `http://localhost:8080/api/v1` directly. The Android app calls `10.0.2.2:8080` directly.

## Run on Android

Start the backend on port `8080`, then:

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

The Android emulator calls the host machine through `10.0.2.2`. For a physical device, change the native URL in `src/app/api.service.ts` to the computer's LAN IP and ensure the backend allows cleartext traffic/CORS.

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
