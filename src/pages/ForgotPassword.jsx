import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, KeyRound, ArrowLeft } from "lucide-react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./Login.css";

function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      setMessage(res.data.message);
    } catch (err) {
      setError(
        err.response
          ? err.response.data?.detail?.[0]?.msg || t("forgotPasswordPage.genericError")
          : t("forgotPasswordPage.connectionError")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container" style={{ gridTemplateColumns: "1fr", maxWidth: 520 }}>
        <div className="login-card-wrapper">
          <div className="login-card">
            <div className="login-card-header">
              <div className="login-icon"><KeyRound size={26} /></div>
              <h2>{t("forgotPasswordPage.title")}</h2>
              <p>{t("forgotPasswordPage.description")}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label htmlFor="forgot-password-email">{t("forgotPasswordPage.email")}</label>
                <div className="login-input-wrapper">
                  <Mail size={19} />
                  <input
                    id="forgot-password-email"
                    type="email"
                    placeholder={t("forgotPasswordPage.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {message && <p style={{ color: "#2f7d32", fontSize: 14 }}>{message}</p>}
              {error && <p style={{ color: "#c62828", fontSize: 14 }}>{error}</p>}

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? t("forgotPasswordPage.sending") : t("forgotPasswordPage.sendResetLink")}
              </button>
            </form>

            <div className="login-signup">
              <Link to="/login"><ArrowLeft size={14} /> {t("forgotPasswordPage.backToLogin")}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
