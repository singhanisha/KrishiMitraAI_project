import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./Login.css";

function ResetPassword() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirm) {
      setError(t("resetPasswordPage.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/auth/reset-password", {
        token,
        new_password: password,
        confirm_password: confirm,
      });
      setMessage(res.data.message || t("resetPasswordPage.successMessage"));
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : detail?.[0]?.msg || t("resetPasswordPage.resetError")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-page">
        <p>
          {t("resetPasswordPage.invalidLink")}{" "}
          <Link to="/forgot-password">{t("resetPasswordPage.requestNewLink")}</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container" style={{ gridTemplateColumns: "1fr", maxWidth: 520 }}>
        <div className="login-card-wrapper">
          <div className="login-card">
            <div className="login-card-header">
              <div className="login-icon"><LockKeyhole size={26} /></div>
              <h2>{t("resetPasswordPage.title")}</h2>
              <p>{t("resetPasswordPage.description")}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label htmlFor="reset-password-new">{t("resetPasswordPage.newPassword")}</label>
                <div className="login-input-wrapper">
                  <LockKeyhole size={19} />
                  <input
                    id="reset-password-new"
                    type={show ? "text" : "password"}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShow(!show)}
                    aria-label={show ? t("resetPasswordPage.hidePassword") : t("resetPasswordPage.showPassword")}
                  >
                    {show ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div className="login-form-group">
                <label htmlFor="reset-password-confirm">{t("resetPasswordPage.confirmPassword")}</label>
                <div className="login-input-wrapper">
                  <LockKeyhole size={19} />
                  <input
                    id="reset-password-confirm"
                    type={show ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              {message && <p style={{ color: "#2f7d32", fontSize: 14 }}>{message}</p>}
              {error && <p style={{ color: "#c62828", fontSize: 14 }}>{error}</p>}

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? t("resetPasswordPage.saving") : t("resetPasswordPage.resetButton")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
