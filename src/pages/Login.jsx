import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, Sprout } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "./Login.css";

function Login() {
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/auth/login",
      {
        email: email,
        password: password,
      }
    );

    console.log("Login successful:", response.data);

    // Store JWT token
    localStorage.setItem(
      "access_token",
      response.data.access_token
    );

    alert(response.data.message);

    // Redirect to Home page
    window.location.href = "/";

  } catch (error) {
    console.error("Login error:", error);

    if (error.response) {
      alert(
        error.response.data?.detail ||
        "Invalid email or password."
      );
    } else {
      alert(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    }
  }
};

  return (
    <div className="login-page">
      <div className="login-container">

        {/* Left Side */}
        <div className="login-left">
          <div className="login-brand">
            <div className="login-brand-icon">
              <Sprout size={30} />
            </div>

            <div>
              <h2>
                KrishiMitra <span>AI</span>
              </h2>
              <p>{t("login.tagline")}</p>
            </div>
          </div>

          <div className="login-welcome">
            <h1>{t("login.welcomeTitle")}</h1>
            <p>{t("login.welcomeDescription")}</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="login-card-wrapper">
          <div className="login-card">

            <div className="login-card-header">
              <div className="login-icon">
                <LockKeyhole size={26} />
              </div>

              <h2>{t("login.title")}</h2>
              <p>{t("login.description")}</p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className="login-form-group">
                <label htmlFor="email">
                  {t("login.email")}
                </label>

                <div className="login-input-wrapper">
                  <Mail size={19} />

                  <input
                    id="email"
                    type="email"
                    placeholder={t("login.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-form-group">
                <div className="login-password-label">
                  <label htmlFor="password">
                    {t("login.password")}
                  </label>

                  {/* <button
                    type="button"
                    className="forgot-password"
                  >
                    {t("login.forgotPassword")}
                  </button> */}
                </div>

                <div className="login-input-wrapper">
                  <LockKeyhole size={19} />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("login.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="login-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>{t("login.rememberMe")}</span>
                </label>
              </div>

              {/* Login Button */}
              <button type="submit" className="login-submit-btn">
                {t("login.loginButton")}
              </button>
            </form>

            {/* Signup */}
            <div className="login-signup">
              <span>{t("login.noAccount")}</span>{" "}
              <Link to="/signup">
                {t("login.signUp")}
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;