import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  FlaskConical,
  Leaf,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
  RotateCcw,
  Sprout,
  Droplets,
  Gauge,
} from "lucide-react";

import "./SoilAnalysis.css";

const API_URL = "http://127.0.0.1:8000";

function SoilAnalysis() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
    ec: "",
    oc: "",
    caco3: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    // Required field validation
    if (
      formData.nitrogen === "" ||
      formData.phosphorus === "" ||
      formData.potassium === "" ||
      formData.ph === ""
    ) {
      setError(t("services.soilAnalysis.validationError"));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nitrogen: Number(formData.nitrogen),
        phosphorus: Number(formData.phosphorus),
        potassium: Number(formData.potassium),
        ph: Number(formData.ph),
        ec: formData.ec === "" ? null : Number(formData.ec),
        oc: formData.oc === "" ? null : Number(formData.oc),
        caco3: formData.caco3 === "" ? null : Number(formData.caco3),
      };

      const response = await axios.post(
        `${API_URL}/soil-analysis/analyze`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      console.error("Soil analysis error:", err);

      if (err.response?.data?.detail) {
        setError(
          typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : t("services.soilAnalysis.invalidDataError")
        );
      } else {
        setError(t("services.soilAnalysis.backendError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nitrogen: "",
      phosphorus: "",
      potassium: "",
      ph: "",
      ec: "",
      oc: "",
      caco3: "",
    });

    setResult(null);
    setError("");
  };

  const getStatusClass = (status) => {
    if (!status) return "";

    const value = status.toLowerCase();

    if (
      value.includes("good") ||
      value.includes("high") ||
      value.includes("optimal") ||
      value.includes("healthy") ||
      value.includes("normal")
    ) {
      return "krishi-soil-1-status-good";
    }

    if (
      value.includes("low") ||
      value.includes("poor") ||
      value.includes("critical") ||
      value.includes("risk")
    ) {
      return "krishi-soil-1-status-warning";
    }

    return "krishi-soil-1-status-neutral";
  };

  return (
    <div className="krishi-soil-1-page">
      {/* HERO */}
      <section className="krishi-soil-1-hero">
        <div className="krishi-soil-1-hero-overlay"></div>

        <div className="krishi-soil-1-container">
          <div className="krishi-soil-1-hero-content">
            <div className="krishi-soil-1-badge">
              <FlaskConical size={18} />
              <span>{t("services.soilAnalysis.aiPowered")}</span>
            </div>

            <h1>
              {t("services.soilAnalysis.heroTitle")}
              <span>
                {t("services.soilAnalysis.heroTitleHighlight")}
              </span>
            </h1>

            <p>
              {t("services.soilAnalysis.heroDescription")}
            </p>

            <div className="krishi-soil-1-hero-points">
              <div>
                <CheckCircle2 size={18} />
                <span>{t("services.soilAnalysis.soilHealthScore")}</span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>{t("services.soilAnalysis.npkAnalysis")}</span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>
                  {t("services.soilAnalysis.actionableInsights")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="krishi-soil-1-main">
        <div className="krishi-soil-1-container">
          <div className="krishi-soil-1-layout">
            {/* INPUT CARD */}
            <section className="krishi-soil-1-form-card">
              <div className="krishi-soil-1-section-heading">
                <div className="krishi-soil-1-heading-icon">
                  <FlaskConical size={23} />
                </div>

                <div>
                  <span className="krishi-soil-1-small-label">
                    {t("services.soilAnalysis.soilTestData")}
                  </span>

                  <h2>
                    {t("services.soilAnalysis.enterSoilParameters")}
                  </h2>

                  <p>
                    {t(
                      "services.soilAnalysis.enterSoilParametersDescription"
                    )}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* REQUIRED PARAMETERS */}
                <div className="krishi-soil-1-form-group">
                  <div className="krishi-soil-1-group-title">
                    <span>
                      {t("services.soilAnalysis.essentialParameters")}
                    </span>

                    <small>
                      {t("services.soilAnalysis.required")}
                    </small>
                  </div>

                  <div className="krishi-soil-1-input-grid">
                    {/* NITROGEN */}
                    <div className="krishi-soil-1-input-wrapper">
                      <label htmlFor="nitrogen">
                        {t("services.soilAnalysis.nitrogen")}{" "}
                        <span>N</span>
                      </label>

                      <div className="krishi-soil-1-input-box">
                        <input
                          id="nitrogen"
                          name="nitrogen"
                          type="number"
                          min="0"
                          max="300"
                          step="any"
                          value={formData.nitrogen}
                          onChange={handleChange}
                          placeholder={t(
                            "services.soilAnalysis.placeholders.nitrogen"
                          )}
                        />

                        <span>
                          {t("services.soilAnalysis.units.kgHa")}
                        </span>
                      </div>
                    </div>

                    {/* PHOSPHORUS */}
                    <div className="krishi-soil-1-input-wrapper">
                      <label htmlFor="phosphorus">
                        {t("services.soilAnalysis.phosphorus")}{" "}
                        <span>P</span>
                      </label>

                      <div className="krishi-soil-1-input-box">
                        <input
                          id="phosphorus"
                          name="phosphorus"
                          type="number"
                          min="0"
                          max="300"
                          step="any"
                          value={formData.phosphorus}
                          onChange={handleChange}
                          placeholder={t(
                            "services.soilAnalysis.placeholders.phosphorus"
                          )}
                        />

                        <span>
                          {t("services.soilAnalysis.units.kgHa")}
                        </span>
                      </div>
                    </div>

                    {/* POTASSIUM */}
                    <div className="krishi-soil-1-input-wrapper">
                      <label htmlFor="potassium">
                        {t("services.soilAnalysis.potassium")}{" "}
                        <span>K</span>
                      </label>

                      <div className="krishi-soil-1-input-box">
                        <input
                          id="potassium"
                          name="potassium"
                          type="number"
                          min="0"
                          max="300"
                          step="any"
                          value={formData.potassium}
                          onChange={handleChange}
                          placeholder={t(
                            "services.soilAnalysis.placeholders.potassium"
                          )}
                        />

                        <span>
                          {t("services.soilAnalysis.units.kgHa")}
                        </span>
                      </div>
                    </div>

                    {/* PH */}
                    <div className="krishi-soil-1-input-wrapper">
                      <label htmlFor="ph">
                        {t("services.soilAnalysis.soilPh")}
                      </label>

                      <div className="krishi-soil-1-input-box">
                        <input
                          id="ph"
                          name="ph"
                          type="number"
                          min="0"
                          max="14"
                          step="0.1"
                          value={formData.ph}
                          onChange={handleChange}
                          placeholder={t(
                            "services.soilAnalysis.placeholders.ph"
                          )}
                        />

                        <span>
                          {t("services.soilAnalysis.units.ph")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* OPTIONAL PARAMETERS */}
                <div className="krishi-soil-1-form-group">
                  <div className="krishi-soil-1-group-title">
                    <span>
                      {t("services.soilAnalysis.additionalParameters")}
                    </span>

                    <small>
                      {t("services.soilAnalysis.optional")}
                    </small>
                  </div>

                  <div className="krishi-soil-1-input-grid">
                    {/* EC */}
                    <div className="krishi-soil-1-input-wrapper">
                      <label htmlFor="ec">
                        {t(
                          "services.soilAnalysis.electricalConductivity"
                        )}{" "}
                        <span>EC</span>
                      </label>

                      <div className="krishi-soil-1-input-box">
                        <input
                          id="ec"
                          name="ec"
                          type="number"
                          min="0"
                          max="20"
                          step="any"
                          value={formData.ec}
                          onChange={handleChange}
                          placeholder={t(
                            "services.soilAnalysis.placeholders.ec"
                          )}
                        />

                        <span>
                          {t("services.soilAnalysis.units.dsM")}
                        </span>
                      </div>
                    </div>

                    {/* OC */}
                    <div className="krishi-soil-1-input-wrapper">
                      <label htmlFor="oc">
                        {t("services.soilAnalysis.organicCarbon")}{" "}
                        <span>OC</span>
                      </label>

                      <div className="krishi-soil-1-input-box">
                        <input
                          id="oc"
                          name="oc"
                          type="number"
                          min="0"
                          max="20"
                          step="any"
                          value={formData.oc}
                          onChange={handleChange}
                          placeholder={t(
                            "services.soilAnalysis.placeholders.oc"
                          )}
                        />

                        <span>
                          {t("services.soilAnalysis.units.percent")}
                        </span>
                      </div>
                    </div>

                    {/* CAC03 */}
                    <div className="krishi-soil-1-input-wrapper">
                      <label htmlFor="caco3">
                        {t("services.soilAnalysis.calciumCarbonate")}{" "}
                        <span>CaCO₃</span>
                      </label>

                      <div className="krishi-soil-1-input-box">
                        <input
                          id="caco3"
                          name="caco3"
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={formData.caco3}
                          onChange={handleChange}
                          placeholder={t(
                            "services.soilAnalysis.placeholders.caco3"
                          )}
                        />

                        <span>
                          {t("services.soilAnalysis.units.percent")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INFO */}
                <div className="krishi-soil-1-info-box">
                  <Info size={19} />

                  <p>
                    {t("services.soilAnalysis.infoMessage")}
                  </p>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="krishi-soil-1-error-box">
                    <AlertTriangle size={19} />
                    <span>{error}</span>
                  </div>
                )}

                {/* BUTTONS */}
                <div className="krishi-soil-1-form-actions">
                  <button
                    type="button"
                    className="krishi-soil-1-reset-btn"
                    onClick={resetForm}
                  >
                    <RotateCcw size={17} />
                    {t("services.soilAnalysis.reset")}
                  </button>

                  <button
                    type="submit"
                    className="krishi-soil-1-analyze-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="krishi-soil-1-spinner"></span>
                        {t("services.soilAnalysis.analyzingSoil")}
                      </>
                    ) : (
                      <>
                        {t("services.soilAnalysis.analyzeSoil")}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* SIDE INFORMATION */}
            <aside className="krishi-soil-1-side-card">
              <div className="krishi-soil-1-side-icon">
                <Sprout size={27} />
              </div>

              <h3>
                {t("services.soilAnalysis.whySoilAnalysis")}
              </h3>

              <p>
                {t(
                  "services.soilAnalysis.whySoilAnalysisDescription"
                )}
              </p>

              <div className="krishi-soil-1-benefit-list">
                <div>
                  <div className="krishi-soil-1-benefit-icon">
                    <Activity size={18} />
                  </div>

                  <div>
                    <strong>
                      {t("services.soilAnalysis.knowSoilHealth")}
                    </strong>

                    <span>
                      {t(
                        "services.soilAnalysis.knowSoilHealthDescription"
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="krishi-soil-1-benefit-icon">
                    <Leaf size={18} />
                  </div>

                  <div>
                    <strong>
                      {t(
                        "services.soilAnalysis.understandNutrients"
                      )}
                    </strong>

                    <span>
                      {t(
                        "services.soilAnalysis.understandNutrientsDescription"
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="krishi-soil-1-benefit-icon">
                    <Droplets size={18} />
                  </div>

                  <div>
                    <strong>
                      {t("services.soilAnalysis.identifyRisks")}
                    </strong>

                    <span>
                      {t(
                        "services.soilAnalysis.identifyRisksDescription"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* RESULT */}
          {result && (
            <section className="krishi-soil-1-result-section">
              <div className="krishi-soil-1-result-heading">
                <div>
                  <span className="krishi-soil-1-small-label">
                    {t("services.soilAnalysis.analysisComplete")}
                  </span>

                  <h2>
                    {t("services.soilAnalysis.soilHealthReport")}
                  </h2>

                  <p>
                    {t("services.soilAnalysis.reportDescription")}
                  </p>
                </div>

                <div className="krishi-soil-1-result-icon">
                  <CheckCircle2 size={28} />
                </div>
              </div>

              {/* SCORE */}
              {result.soil_health_score && (
                <div className="krishi-soil-1-score-card">
                  <div className="krishi-soil-1-score-circle">
                    <div>
                      <strong>
                        {result.soil_health_score.score}
                      </strong>

                      <span>/100</span>
                    </div>
                  </div>

                  <div className="krishi-soil-1-score-content">
                    <span className="krishi-soil-1-score-label">
                      {t(
                        "services.soilAnalysis.soilHealthScoreLabel"
                      )}
                    </span>

                    <h3>
                      {result.soil_health_score.rating}
                    </h3>

                    <p>
                      {result.soil_health_score.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* PARAMETERS */}
              {result.parameters_analyzed && (
                <div className="krishi-soil-1-result-block">
                  <div className="krishi-soil-1-result-block-heading">
                    <Gauge size={21} />
                    <h3>
                      {t("services.soilAnalysis.parameterAnalysis")}
                    </h3>
                  </div>

                  <div className="krishi-soil-1-parameter-grid">
                    {Object.entries(result.parameters_analyzed).map(
                      ([key, parameter]) => (
                        <div
                          className="krishi-soil-1-parameter-card"
                          key={key}
                        >
                          <div className="krishi-soil-1-parameter-top">
                            <span>{key.toUpperCase()}</span>

                            <span
                              className={`krishi-soil-1-status-badge ${getStatusClass(
                                parameter.status_badge ||
                                  parameter.relative_level
                              )}`}
                            >
                              {parameter.status_badge ||
                                parameter.relative_level}
                            </span>
                          </div>

                          <div className="krishi-soil-1-parameter-value">
                            <strong>
                              {parameter.input_value}
                            </strong>

                            <span>{parameter.unit}</span>
                          </div>

                          <p>{parameter.interpretation}</p>

                          {parameter.dataset_range && (
                            <div className="krishi-soil-1-range">
                              {t(
                                "services.soilAnalysis.datasetRange"
                              )}
                              :{" "}
                              <strong>
                                {parameter.dataset_range[0]} –{" "}
                                {parameter.dataset_range[1]}
                              </strong>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* NPK BALANCE */}
              {result.npk_balance && (
                <div className="krishi-soil-1-npk-card">
                  <div className="krishi-soil-1-npk-icon">
                    <Leaf size={25} />
                  </div>

                  <div className="krishi-soil-1-npk-content">
                    <span className="krishi-soil-1-small-label">
                      {t("services.soilAnalysis.npkBalance")}
                    </span>

                    <h3>
                      {result.npk_balance.ratio_string}
                    </h3>

                    <strong>
                      {result.npk_balance.balance_status}
                    </strong>

                    <p>
                      {result.npk_balance.interpretation}
                    </p>
                  </div>
                </div>
              )}

              {/* SUMMARY */}
              {result.soil_summary && (
                <div className="krishi-soil-1-summary-card">
                  <div className="krishi-soil-1-result-block-heading">
                    <Sprout size={21} />

                    <h3>
                      {t("services.soilAnalysis.soilSummary")}
                    </h3>
                  </div>

                  <p>{result.soil_summary}</p>
                </div>
              )}

              {/* OBSERVATIONS + RISKS */}
              <div className="krishi-soil-1-observation-grid">
                {result.key_observations?.length > 0 && (
                  <div className="krishi-soil-1-observation-card">
                    <div className="krishi-soil-1-observation-heading">
                      <CheckCircle2 size={21} />

                      <h3>
                        {t(
                          "services.soilAnalysis.keyObservations"
                        )}
                      </h3>
                    </div>

                    <ul>
                      {result.key_observations.map((item, index) => (
                        <li key={index}>
                          <span></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.risk_flags?.length > 0 && (
                  <div className="krishi-soil-1-risk-card">
                    <div className="krishi-soil-1-observation-heading">
                      <AlertTriangle size={21} />

                      <h3>
                        {t("services.soilAnalysis.riskFlags")}
                      </h3>
                    </div>

                    <ul>
                      {result.risk_flags.map((item, index) => (
                        <li key={index}>
                          <span></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* DISCLAIMER */}
              {result.disclaimer && (
                <div className="krishi-soil-1-disclaimer">
                  <Info size={19} />

                  <div>
                    <strong>
                      {t("services.soilAnalysis.important")}
                    </strong>

                    <p>{result.disclaimer}</p>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default SoilAnalysis;