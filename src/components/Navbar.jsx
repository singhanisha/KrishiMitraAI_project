import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronDown, Sprout, UserRound, Menu, X } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const { t, i18n } = useTranslation();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages = [
    {
      code: "en",
      name: "English",
    },
    {
      code: "hi",
      name: "हिंदी",
    },
    {
      code: "mr",
      name: "मराठी",
    },
    {
      code: "pa",
      name: "ਪੰਜਾਬੀ",
    },
    {
    code: "bn",
    name: "বাংলা",
  },
  {
    code: "gu",
    name: "ગુજરાતી",
  },
  {
    code: "ta",
    name: "தமிழ்",
  },
  {
    code: "te",
    name: "తెలుగు",
  },
  {
    code: "kn",
    name: "ಕನ್ನಡ",
  },
  {
    code: "ml",
    name: "മലയാളം",
  },
  {
    code: "or",
    name: "ଓଡ଼ିଆ",
  },
  {
    code: "bho",
    name: "भोजपुरी",
  },
  ];

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    setLanguageOpen(false);
  };

  const currentLanguage =
    languages.find((language) => language.code === i18n.language)?.name ||
    "English";

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        <div className="logo-icon">
          <Sprout size={30} strokeWidth={2} />
        </div>

        <div className="logo-text">
          <span>KrishiMitra</span> AI
          <small>Your Smart Agriculture Companion</small>
        </div>
      </Link>

      {/* Navigation */}
      <div className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>

        <Link to="/" onClick={() => setMobileMenuOpen(false)}>
          {t("navbar.home")}
        </Link>

        <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
          {t("navbar.about")}
        </Link>

        <Link to="/services" onClick={() => setMobileMenuOpen(false)}>
          {t("navbar.services")}
        </Link>

        <Link to="/resources" onClick={() => setMobileMenuOpen(false)}>
          {t("navbar.resources")}
        </Link>

        <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
          {t("navbar.contact")}
        </Link>

      </div>

      <button
        className="mobile-menu-button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Right Side */}
      <div className="navbar-right">

        {/* Language Dropdown */}
        <div className="language-container">
          <button
            className="language-button"
            onClick={() => setLanguageOpen(!languageOpen)}
          >
            {currentLanguage}
            <ChevronDown size={16} />
          </button>

          {languageOpen && (
            <div className="language-menu">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => changeLanguage(language.code)}
                  className={
                    i18n.language === language.code
                      ? "language-option active"
                      : "language-option"
                  }
                >
                  {language.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Login */}
        <button className="login-button">
          <UserRound size={17} />
          {t("navbar.login")}
        </button>

      </div>
    </nav>
  );
}

export default Navbar;