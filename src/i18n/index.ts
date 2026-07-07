import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

// Language priority: a previously saved choice, else the system locale, else English.
const saved = localStorage.getItem("lang");
const detected = navigator.language.startsWith("fr") ? "fr" : "en";

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: saved ?? detected,
  fallbackLng: "en",
  interpolation: { escapeValue: false }, // React already escapes values
});

export default i18n;
