import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const useLanguage = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // update HTML lang attribute
    document.documentElement.lang = i18n.language;

    // update HTML title
    const title = document.querySelector("title");
    if (title) {
      title.textContent = "Presentation";
    }
  }, [i18n.language]);

  return {
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage.bind(i18n),
  };
};
