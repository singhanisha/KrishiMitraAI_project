import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import english from "./locales/en/translation.json";
import hindi from "./locales/hi/translation.json";
import marathi from "./locales/mr/translation.json";
import punjabi from "./locales/pa/translation.json";
import bengali from "./locales/bn/translation.json";
import gujarati from "./locales/gu/translation.json";
import tamil from "./locales/ta/translation.json";
import telugu from "./locales/te/translation.json";
import kannada from "./locales/kn/translation.json";
import malayalam from "./locales/ml/translation.json";
import odia from "./locales/or/translation.json";
import bhojpuri from "./locales/bho/translation.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: english,
      },

      hi: {
        translation: hindi,
      },

      mr: {
        translation: marathi,
      },

      pa: {
        translation: punjabi,
      },

      bn: {
        translation: bengali,
      },

      gu: {
        translation: gujarati,
      },

      ta: {
        translation: tamil,
      },

      te: {
        translation: telugu,
      },

      kn: {
        translation: kannada,
      },

      ml: {
        translation: malayalam,
      },

      or: {
        translation: odia,
      },

      bho: {
        translation: bhojpuri,
      },
    },

    lng: "en",

    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;