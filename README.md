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

Email OTP requires SMTP configuration. Gmail App Password can be used for SMTP during testing. Store real SMTP values only in Render Environment variables:

```bash
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

After deploying email verification changes, run the Neon/Render migration deploy and redeploy the backend.

---

## Build APK

```bash
npx eas build -p android --profile preview
```

Google Sign-In should be tested in an EAS preview or development build, not in Expo Go.

Preview Android builds use the app name `NutriTrack Preview` and package name `com.zeynepdeniz.nutritrack.preview` so testers can install them separately from production builds. Production Android builds keep `com.zeynepdeniz.nutritrack`.

If Google Sign-In is tested in the preview APK, create a separate Android OAuth Client in Google Cloud Console for package `com.zeynepdeniz.nutritrack.preview` using the EAS preview keystore SHA-1. The Web Client ID used by the backend can stay the same.

---

## Developer

**Zeynep Deniz**

NutriTrack is a full-stack mobile app project focused on nutrition tracking, AI-assisted food analysis, and modern mobile user experience.
