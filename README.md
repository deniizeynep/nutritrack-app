# NutriTrack

NutriTrack is a React Native / Expo calorie tracking app with a Node.js, Express, Prisma and PostgreSQL backend.

## Environment

Do not commit real `.env` files. Use the example files as templates.

Mobile `.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:5000/api
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
```

Google Sign-In on mobile also needs `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

For Expo Go on a physical phone, do not use `localhost`. Use your computer's LAN IP. For production APK builds, set `EXPO_PUBLIC_API_URL` to the live backend URL.

Server `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="generate_a_secure_secret_with_openssl_rand_base64_32"
PORT=5000
CORS_ORIGIN="https://YOUR_FRONTEND_DOMAIN"
AI_PROVIDER="gemini"
GOOGLE_WEB_CLIENT_ID=""
OPENAI_API_KEY=""
OPENAI_FOOD_MODEL="gpt-4o-mini"
GEMINI_API_KEY=""
GEMINI_FOOD_MODEL="gemini-2.5-flash"
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

## Backend Smoke Test

Run the backend in one terminal:

```bash
cd server
npm run dev
```

Run the smoke test in another terminal:

```bash
cd server
npm run test:smoke
PHOTO_PATH="$HOME/Downloads/food.jpg" npm run test:ai-upload
npm run test:barcode
```

Use a deployed API URL:

```bash
API_URL=https://YOUR_BACKEND_URL/api npm run test:smoke
API_URL=https://YOUR_BACKEND_URL/api PHOTO_PATH="$HOME/Downloads/food.jpg" npm run test:ai-upload
API_URL=https://YOUR_BACKEND_URL/api npm run test:barcode
```

The smoke test covers health, auth, meal and goal endpoints. AI photo upload has a separate multipart test script. Barcode lookup has a separate script because it depends on the external Open Food Facts API.

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
- `AI_PROVIDER`
- `OPENAI_API_KEY`
- `OPENAI_FOOD_MODEL`
- `GEMINI_API_KEY`
- `GEMINI_FOOD_MODEL`
- `GOOGLE_WEB_CLIENT_ID`

### Backend Deploy Checklist

- Set `DATABASE_URL`, `JWT_SECRET`, `PORT`, and `CORS_ORIGIN`
- Set `GOOGLE_WEB_CLIENT_ID` for Google sign-in
- Choose `AI_PROVIDER=gemini`, `openai`, or `mock`
- Set the matching AI provider keys and model names
- Run `npm run db:deploy` after the backend is live
- Check `GET /api/health` after deploy

Backend Docker build example:

```bash
cd server && docker build -t nutritrack-api .
```

Backend Docker run example:

```bash
docker run -p 5000:5000 --env-file .env nutritrack-api
```

In production, provide real environment variables through the deploy platform instead of baking them into the image. Run production migrations with `npm run db:deploy`. After deploy, check `/api/health` to verify the API and database connection.

Food photo analysis uses `AI_PROVIDER=mock` by default. Use `AI_PROVIDER=openai` with `OPENAI_API_KEY` and `OPENAI_FOOD_MODEL` for OpenAI. Use `AI_PROVIDER=gemini` with `GEMINI_API_KEY` and `GEMINI_FOOD_MODEL` for Gemini. AI keys stay only in the server `.env`; never put them in the mobile app. Provider free tiers may be limited. Food analysis is an estimate and users should be able to edit the result.

## AI Gateway

The backend is structured as an AI Gateway so future mobile or web apps can call this backend instead of integrating AI providers directly. Provider selection is controlled by environment variables: `AI_PROVIDER=mock`, `AI_PROVIDER=gemini`, or `AI_PROVIDER=openai`. API keys stay only in the backend environment. AI usage metadata is stored in the database, including app name, feature, provider, model, input type, status, duration and safe error details. Photos, base64 payloads and API keys are not stored. Users can fetch their own recent usage with `GET /api/ai/usage/me`.

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
