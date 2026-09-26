import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sprout,
  User,
  Phone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import "./Signup.css";

function Signup() {
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const mobileRegex = /^[6-9][0-9]{9}$/;

  // Frontend validation
  if (!emailRegex.test(formData.email)) {
    alert(t("signup.invalidEmail"));
    return;
  }

  if (!mobileRegex.test(formData.phone)) {
    alert(t("signup.invalidPhone"));
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    alert(t("signup.passwordMismatch"));
    return;
  }

  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/auth/register",
      {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      }
    );

    console.log("Signup successful:", response.data);

    // Store JWT token
    localStorage.setItem(
      "access_token",
      response.data.access_token
    );

    alert(response.data.message);

    // Redirect to login page
    window.location.href = "/login";

  } catch (error) {
    console.error("Signup error:", error);

    if (error.response) {
      alert(
        error.response.data?.detail ||
        "Signup failed. Please try again."
      );
    } else {
      alert(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    }
  }
};

  return (
    <div className="signup-page">
      <div className="signup-container">

        {/* =========================
            LEFT SIDE
        ========================== */}
        <div className="signup-left">

          <div className="signup-brand">
            <div className="signup-brand-icon">
              <Sprout size={30} />
            </div>

            <div>
              <h2>
                KrishiMitra <span>AI</span>
              </h2>

              {/* <p>{t("navbar.tagline")}</p> */}
            </div>
          </div>

          <div className="signup-welcome">
            <h1>{t("signup.welcomeTitle")}</h1>

            <p>
              {t("signup.welcomeDescription")}
            </p>
          </div>

        </div>


        {/* =========================
            RIGHT SIDE
        ========================== */}
        <div className="signup-card-wrapper">

          <div className="signup-card">

            <div className="signup-card-header">

              <div className="signup-icon">
                <Sprout size={26} />
              </div>

              <h2>{t("signup.title")}</h2>

              <p>{t("signup.description")}</p>

            </div>


            <form onSubmit={handleSubmit}>

              {/* Full Name */}
              <div className="signup-form-group">

                <label htmlFor="name">
                  {t("signup.fullName")}
                </label>

                <div className="signup-input-wrapper">

                  <User size={19} />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t("signup.fullNamePlaceholder")}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* Email */}
              <div className="signup-form-group">

                <label htmlFor="email">
                  {t("signup.email")}
                </label>

                <div className="signup-input-wrapper">

                  <Mail size={19} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("signup.emailPlaceholder")}
                    value={formData.email}
                    onChange={handleChange}
                    pattern="[a-zA-Z0-9._%+-]+@gmail\.com"
                    title={t("signup.emailValidation")}
                    required
                />

                </div>

              </div>


              {/* Phone */}
              <div className="signup-form-group">

                <label htmlFor="phone">
                  {t("signup.phone")}
                </label>

                <div className="signup-input-wrapper">

                  <Phone size={19} />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={t("signup.phonePlaceholder")}
                    value={formData.phone}
                    onChange={(e) => {
                        const value = e.target.value;

                        if (/^\d*$/.test(value) && value.length <= 10) {
                        setFormData((prev) => ({
                            ...prev,
                            phone: value,
                        }));
                        }
                    }}
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    title={t("signup.phoneValidation")}
                    required
                />

                </div>

              </div>


              {/* Password */}
              <div className="signup-form-group">

                <label htmlFor="password">
                  {t("signup.password")}
                </label>

                <div className="signup-input-wrapper">

                  <LockKeyhole size={19} />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("signup.passwordPlaceholder")}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

              </div>


              {/* Confirm Password */}
              <div className="signup-form-group">

                <label htmlFor="confirmPassword">
                  {t("signup.confirmPassword")}
                </label>

                <div className="signup-input-wrapper">

                  <LockKeyhole size={19} />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder={t(
                      "signup.confirmPasswordPlaceholder"
                    )}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

              </div>


              {/* Signup Button */}
              <button
                type="submit"
                className="signup-submit-btn"
              >
                {t("signup.signupButton")}
              </button>

            </form>


            {/* Login */}
            <div className="signup-login">

              <span>
                {t("signup.alreadyAccount")}
              </span>{" "}

              <Link to="/login">
                {t("signup.login")}
              </Link>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Signup;