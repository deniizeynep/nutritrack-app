# NutriTrack 🥗

NutriTrack is a mobile calorie and nutrition tracking app built with React Native, Expo, and a Node.js backend.

Users can create nutrition goals, track meals, scan barcodes, analyze food photos with AI, and view weekly, monthly, and yearly statistics.

---

## Features

- Email/password authentication
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

---

## Build APK

```bash
npx eas build -p android --profile preview
```

Google Sign-In should be tested in an EAS preview or development build, not in Expo Go.

---

## Developer

**Zeynep Deniz**

NutriTrack is a full-stack mobile app project focused on nutrition tracking, AI-assisted food analysis, and modern mobile user experience.
