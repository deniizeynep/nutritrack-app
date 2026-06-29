export type Language = "tr" | "en";

export const translations = {
  appName: {
    tr: "NutriTrack",
    en: "NutriTrack",
  },

  welcomeTitle: {
    tr: "Yediklerini takip et,\nhedeflerine ulaş!",
    en: "Track your meals,\nreach your goals!",
  },

  welcomeSubtitle: {
    tr: "Kalori, makro, barkod ve fotoğrafla yemek takibi tek yerde.",
    en: "Calories, macros, barcode and photo-based food tracking in one place.",
  },

  start: {
    tr: "Başla",
    en: "Get Started",
  },

  alreadyHaveAccount: {
    tr: "Zaten hesabın var mı?",
    en: "Already have an account?",
  },

  login: {
    tr: "Giriş Yap",
    en: "Log In",
  },

  createAccount: {
    tr: "Hesap Oluştur",
    en: "Create Account",
  },

  continueDemo: {
    tr: "Şimdilik Devam Et",
    en: "Continue for Now",
  },

  home: {
    tr: "Ana Sayfa",
    en: "Home",
  },

  diary: {
    tr: "Günlük",
    en: "Diary",
  },

  stats: {
    tr: "İstatistik",
    en: "Stats",
  },

  profile: {
    tr: "Profil",
    en: "Profile",
  },

  today: {
    tr: "Bugün",
    en: "Today",
  },

  remaining: {
    tr: "Kalan",
    en: "Remaining",
  },

  calories: {
    tr: "Kalori",
    en: "Calories",
  },

  kcal: {
    tr: "kcal",
    en: "kcal",
  },

  protein: {
    tr: "Protein",
    en: "Protein",
  },

  carbs: {
    tr: "Karbonhidrat",
    en: "Carbs",
  },

  fat: {
    tr: "Yağ",
    en: "Fat",
  },

  meals: {
    tr: "Öğünler",
    en: "Meals",
  },

  breakfast: {
    tr: "Kahvaltı",
    en: "Breakfast",
  },

  lunch: {
    tr: "Öğle Yemeği",
    en: "Lunch",
  },

  dinner: {
    tr: "Akşam Yemeği",
    en: "Dinner",
  },

  addMeal: {
    tr: "Öğün Ekle",
    en: "Add Meal",
  },

  scanWithPhoto: {
    tr: "Fotoğrafla Tara",
    en: "Photo Scan",
  },

  scanBarcode: {
    tr: "Barkod Tara",
    en: "Barcode Scan",
  },

  dailySummary: {
    tr: "Günlük Özet",
    en: "Daily Summary",
  },

  target: {
    tr: "Hedef",
    en: "Goal",
  },

  water: {
    tr: "Su",
    en: "Water",
  },

  comingSoon: {
    tr: "Bu sayfayı birazdan tasarlayacağız.",
    en: "We will design this screen soon.",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export const translate = (key: TranslationKey, language: Language) => {
  return translations[key][language];
};
