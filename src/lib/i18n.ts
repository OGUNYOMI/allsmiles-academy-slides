import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Chinese translation
const zhCN = {};

// English translation
const enUS = {
  common: {
    presentation: "Presentation",
    fullscreen: "Fullscreen Preview",
    exitFullscreen: "Exit Fullscreen",
    previous: "Previous",
    next: "Next",
    reset: "Reset Position",
    export: "Export",
    exportPDF: "Export PDF",
    exporting: "Exporting",
    exportingProgress: "Exporting ({{current}}/{{total}})",
    settings: "Settings",
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    loading: "Loading...",
    error: "Error",
    success: "Success",
  },
  navigation: {
    previousSlide: "Previous slide",
    nextSlide: "Next slide",
    fullScreen: "Full screen",
    exitFullscreen: "Exit fullscreen",
    resetPosition: "Reset position",
    slideGrid: "Slide Grid",
    slideGridDescription: "View all slides",
  },
  pdf: {
    exportSettings: "PDF Export Settings",
    exportMode: "Export Mode",
    imageMode: "Image Mode",
    htmlMode: "HTML Mode",
    fullScreen: "Full Screen",
    imageQuality: "Image Quality",
    pageSize: "Page Size",
    a4: "A4",
    letter: "Letter",
    export: "Export PDF",
    exporting: "Exporting...",
    exportProgress: "Exporting ({{current}}/{{total}})",
    description: "Customize PDF export quality and format options",
    fullScreenDescription: "Remove PDF page margins to let slides fill the entire page",
    qualityDescription: "Lower quality can reduce file size but may affect image clarity",
    selectModePlaceholder: "Select export mode",
    imageModeDescription: "Export slides as images, larger files but precise display",
    htmlModeDescription: "Maintain HTML content structure, editable text, smaller files",
    fileSizeEstimate: "File Size Estimate",
    exportModeLabel: "Export Mode",
    imageModeLabel: "Image Mode",
    htmlModeLabel: "HTML Mode",
    qualityLabel: "Image Quality",
    formatLabel: "Format",
    jpegCompressed: "JPEG (compressed)",
    htmlToPdf: "HTML to PDF",
    estimatedPerPage: "Estimated per page",
    textEditable: "Text editable, smaller files",
    sizeRange: {
      low: "0.5-1MB",
      medium: "1-2MB",
      high: "2-3MB",
      html: "0.1-0.5MB",
    },
  },
  slides: {
    welcome: "Welcome to Our Presentation",
    subtitle: "Discover amazing features and capabilities that will transform your workflow",
    thankYou: "Thank You!",
    contact: "Contact Us",
    email: "contact@example.com",
    phone: "+1 (555) 123-4567",
    website: "www.example.com",
  },
  sidebar: {
    slides: "Slides",
    outline: "Outline",
    thumbnail: "Thumbnail",
  },
  errors: {
    exportFailed: "Export failed",
    slideNotFound: "Slide not found",
    networkError: "Network error",
  },
};

const resources = {
  "zh-CN": {
    translation: zhCN,
  },
  "en-US": {
    translation: enUS,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en-US",
    lng: "en-US", // force default to English
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;
