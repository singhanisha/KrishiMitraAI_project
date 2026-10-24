import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Sprout,
  UserRound,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect  } from "react";
import axios from "axios";                                     
import { isLoggedIn, logout, getToken, getUserName, setUserName } from "../utils/auth";

function Navbar() {
  const { t, i18n } = useTranslation();

  const [languageOpen, setLanguageOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const loggedIn = isLoggedIn();
  const [userName, setUserNameState] = useState(getUserName());
  

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
    { code: "mr", name: "मराठी" },
    { code: "pa", name: "ਪੰਜਾਬੀ" },
    { code: "bn", name: "বাংলা" },
    { code: "gu", name: "ગુજરાતી" },
    { code: "ta", name: "தமிழ்" },
    { code: "te", name: "తెలుగు" },
    { code: "kn", name: "ಕನ್ನಡ" },
    { code: "ml", name: "മലയാളം" },
    { code: "or", name: "ଓଡ଼ିଆ" },
  ];

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    setLanguageOpen(false);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
      if (!loggedIn || userName) return;
      axios
        .get("http://127.0.0.1:8000/auth/me", {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        .then((res) => {
          setUserName(res.data.full_name);
          setUserNameState(res.data.full_name);
        })
        .catch(() => {});
    }, [loggedIn, userName]);
  
    const firstName = (userName || "").trim().split(" ")[0];

  const currentLanguage =
    languages.find(
      (language) => language.code === i18n.language
    )?.name || "English";

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">

      {/* =========================
          LOGO
      ========================== */}
      <Link
        to="/"
        className="navbar-logo"
        onClick={closeMobileMenu}
      >
        <div className="logo-icon">
          <Sprout size={30} strokeWidth={2} />
        </div>

        <div className="logo-text">
          <span>KrishiMitra</span> AI
          <small>{t("navbar.tagline")}</small>
        </div>
      </Link>


      {/* =========================
          NAVIGATION LINKS
      ========================== */}
      <div
        className={`nav-links ${
          mobileMenuOpen ? "mobile-open" : ""
        }`}
      >
        <Link
          to="/"
          onClick={closeMobileMenu}
        >
          {t("navbar.home")}
        </Link>

        <Link
          to="/about"
          onClick={closeMobileMenu}
        >
          {t("navbar.about")}
        </Link>

        <Link
          to="/services"
          onClick={closeMobileMenu}
        >
          {t("navbar.services")}
        </Link>

        <Link
          to="/contact"
          onClick={closeMobileMenu}
        >
          {t("navbar.contact")}
        </Link>
      </div>


      {/* =========================
          MOBILE MENU BUTTON
      ========================== */}
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() =>
          setMobileMenuOpen(!mobileMenuOpen)
        }
        aria-label={t("navbar.toggleMenu")}
      >
        {mobileMenuOpen ? (
          <X size={26} />
        ) : (
          <Menu size={26} />
        )}
      </button>


      {/* =========================
          RIGHT SIDE
      ========================== */}
      <div className="navbar-right">

        {/* LANGUAGE */}
        <div className="language-container">

          <button
            type="button"
            className="language-button"
            onClick={() =>
              setLanguageOpen(!languageOpen)
            }
          >
            {currentLanguage}
            <ChevronDown size={16} />
          </button>

          {languageOpen && (
            <div className="language-menu">

              {languages.map((language) => (
                <button
                  type="button"
                  key={language.code}
                  onClick={() =>
                    changeLanguage(language.code)
                  }
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


        {/* LOGIN */}
        {loggedIn ? (
          <>
            <span className="user-chip" title={userName}>
              <UserRound size={17} />
                {firstName || t("navbar.account", "Account")}
            </span>
        
            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              <LogOut size={16} />
              {t("navbar.logout", "Logout")}
            </button>
          </>
            ) : (
              <Link
                to="/login"
                className="login-button"
                onClick={() => {
                setLanguageOpen(false);
                setMobileMenuOpen(false);
                }}
              >
              <UserRound size={17} />
                {t("navbar.login")}
              </Link>
            )}

      </div>

    </nav>
  );
}

export default Navbar;