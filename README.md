# NutriTrack

NutriTrack is a React Native / Expo calorie tracking app with a Node.js, Express, Prisma and PostgreSQL backend.

## Environment

Do not commit real `.env` files. Use the example files as templates.

Mobile `.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:5000/api
```

For Expo Go on a physical phone, do not use `localhost`. Use your computer's LAN IP. For production APK builds, set `EXPO_PUBLIC_API_URL` to the live backend URL.

Server `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="generate_a_secure_secret_with_openssl_rand_base64_32"
PORT=5000
CORS_ORIGIN="*"
```

Generate a JWT secret with:

```bash
openssl rand -base64 32
```

## Backend

Install and run the API:

```bash
cd server
npm install
npm run db:migrate
npm run dev
```

The API listens on `0.0.0.0:5000` by default so phones on the same Wi-Fi can reach it.

## Deployment

Server build command:

```bash
cd server && npm install && npm run db:generate && npm run build
```

Server start command:

```bash
cd server && npm run start
```

The production start script runs the compiled API from `dist/src/index.js`.

Production migration command:

```bash
cd server && npm run db:deploy
```

Production backend environment variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `CORS_ORIGIN`

Backend Docker build example:

```bash
cd server && docker build -t nutritrack-api .
```

Backend Docker run example:

```bash
docker run -p 5000:5000 --env-file .env nutritrack-api
```

In production, provide real environment variables through the deploy platform instead of baking them into the image. Run production migrations with `npm run db:deploy`. After deploy, check `/api/health` to verify the API and database connection.

Mobile production `.env`:

```env
EXPO_PUBLIC_API_URL=https://YOUR_BACKEND_URL/api
```

## Android Builds

Install EAS CLI:

```bash
npm install -g eas-cli
```

Login and configure the project:

```bash
eas login
eas build:configure
```

Build a preview APK for internal testing:

```bash
eas build -p android --profile preview
```

Build a production AAB for Google Play:

```bash
eas build -p android --profile production
```

Before creating an APK or AAB, set `EXPO_PUBLIC_API_URL` to the live backend URL. If you build with a local IP address, the app will not reach the backend on your friends' phones. Deploy the backend first, then build the Android app.

## Mobile

Install and run the Expo app:

```bash
npm install
npx expo start
```

## Security Notes

- Keep `DATABASE_URL`, `JWT_SECRET`, AI keys and other secrets only on the backend.
- Do not put database URLs or secret keys in the mobile app.
- Commit `.env.example` files, not real `.env` files.
- Configure `CORS_ORIGIN` to a specific origin in production when needed.
- Auth register/login endpoints use rate limiting.
- The AI photo analysis endpoint requires authentication and uses rate limiting.
- Rate limit values can be made configurable with environment variables later.
