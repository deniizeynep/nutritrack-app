# NutriTrack 🥗

NutriTrack is a mobile calorie and nutrition tracking app built with React Native, Expo, and a Node.js backend.

Users can create nutrition goals, track meals, scan barcodes, analyze food photos with AI, and view weekly, monthly, and yearly statistics.

---

## Features

- Email/password authentication
- Gmail OTP email verification
- Google Sign-In support
- Daily calorie goal calculation
- Goal-based macro targets
- Manual meal tracking
- Barcode product lookup
- AI food photo analysis
- Meal history
- Weekly, monthly, and yearly statistics
- Profile and settings screens
- Dark/light theme
- Turkish and English language support

---

## Tech Stack

### Mobile

- React Native
- Expo
- Expo Router
- TypeScript
- Zustand
- AsyncStorage

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT Authentication
- bcrypt

### Services

- Gemini AI
- Google OAuth
- Open Food Facts
- Neon PostgreSQL
- Render
- EAS Build

---

## Project Structure

```txt
nutritrack/
  app/
    (auth)/
    (tabs)/
    add-meal.tsx
    goal.tsx
    scan-barcode.tsx
    scan-photo.tsx
    settings.tsx

  src/
    components/
    services/
    stores/
    i18n/
    utils/

  server/
    prisma/
    src/
```

---

## Run Locally

### Mobile

```bash
npm install
npx expo start -c
```

### Backend

```bash
cd server
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Production/dev email provider: NutriTrack uses Brevo Transactional Email API for OTP emails. Store real email values only in Render Environment variables:

```bash
ENABLE_EMAIL_OTP=true
BREVO_API_KEY=
EMAIL_FROM_NAME=NutriTrack
EMAIL_FROM_EMAIL=verified sender email
```

Brevo Free plan allows 300 emails per day. The sender email must be verified in Brevo. A domain is recommended for production deliverability, but a verified sender email can be used during early-stage development. Render Free blocks outbound SMTP ports, so SMTP is not recommended on Render Free.

After deploying email verification changes, run the Neon/Render migration deploy and redeploy the backend.

If the backend runs on Render Free plan, the first request can still be slow because of cold start. Register and forgot password email delivery run in the background after OTP hashes are saved, but a sleeping service may still take time to wake up. Use a paid Render instance or always-on hosting for faster production responses.

---

## Build APK

```bash
npx eas build -p android --profile preview
```

Google Sign-In should be tested in a standalone APK, EAS preview, or development build, not in Expo Go.

Preview Android builds use the app name `NutriTrack Preview` and package name `com.zeynepdeniz.nutritrack.preview` so testers can install them separately from production builds. Production Android builds keep `com.zeynepdeniz.nutritrack`.

Google Sign-In for Android requires an Android OAuth Client in Google Cloud Console with the same Android package name and SHA-1 fingerprint as the APK. Local preview APKs use `com.zeynepdeniz.nutritrack.preview` when built with `APP_VARIANT=preview`; default local release APKs use `com.zeynepdeniz.nutritrack`. Get the local SHA-1 with:

```bash
cd android
./gradlew signingReport
```

Set the Web Client ID in `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` for the mobile app and `GOOGLE_WEB_CLIENT_ID` for the backend. Do not use an Android Client ID as the web client ID.

---

## Developer

**Zeynep Deniz**

NutriTrack is a full-stack mobile app project focused on nutrition tracking, AI-assisted food analysis, and modern mobile user experience.
