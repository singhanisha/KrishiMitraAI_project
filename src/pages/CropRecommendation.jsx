import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sprout,
  FlaskConical,
  ArrowRight,
  RotateCcw,
  Layers,
  Thermometer,
  Sparkles,
  Gauge,
} from "lucide-react";

import { predictCrop } from "../services/cropService";
import "./css/CropRecommendation.css";

const initialForm = {
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  temperature: "",
  humidity: "",
  ph: "",
  rainfall: "",
};

const PRESETS = [
  {
    key: "rice",
    data: {
      nitrogen: 90,
      phosphorus: 42,
      potassium: 43,
      temperature: 25.5,
      humidity: 82,
      ph: 6.5,
      rainfall: 200,
    },
  },
  {
    key: "maize",
    data: {
      nitrogen: 80,
      phosphorus: 48,
      potassium: 20,
      temperature: 24.5,
      humidity: 64.9,
      ph: 6.2,
      rainfall: 95,
    },
  },
  {
    key: "cotton",
    data: {
      nitrogen: 120,
      phosphorus: 45,
      potassium: 20,
      temperature: 24,
      humidity: 80,
      ph: 6.9,
      rainfall: 80,
    },
  },
];

const CropRecommendation = () => {
  const { t, i18n } = useTranslation();

  const [formValues, setFormValues] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyPreset = (preset) => {
    setFormValues(
      Object.fromEntries(
        Object.entries(preset.data).map(([key, val]) => [key, String(val)])
      )
    );

    setResult(null);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const data = await predictCrop({
        ...formValues,
        language: i18n.language,
      });

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormValues(initialForm);
    setResult(null);
    setError(null);
  };

  /*
   * Backend returns translated confidence tier text.
   * We keep CSS classes based on the canonical English tier
   * so existing CSS continues to work.
   */
  const getConfidenceTierClass = (tier) => {
    const normalized = String(tier || "").toLowerCase();

    if (
      normalized === "high" ||
      normalized === "उच्च" ||
      normalized === "ઉચ્ચ" ||
      normalized === "उच्च"
    ) {
      return "high";
    }

    if (
      normalized === "moderate" ||
      normalized === "मध्यम" ||
      normalized === "મધ્યમ" ||
      normalized === "মাঝারি" ||
      normalized === "ਮੱਧਮ" ||
      normalized === "ମଧ୍ୟମ" ||
      normalized === "மிதமான" ||
      normalized === "మధ్యస్థ" ||
      normalized === "ಮಧ್ಯಮ" ||
      normalized === "മിതമായ"
    ) {
      return "moderate";
    }

    if (
      normalized === "low" ||
      normalized === "कम" ||
      normalized === "ઓછું" ||
      normalized === "কম" ||
      normalized === "ਘੱਟ" ||
      normalized === "କମ୍" ||
      normalized === "குறைவு" ||
      normalized === "తక్కువ" ||
      normalized === "ಕಡಿಮೆ" ||
      normalized === "കുറവ്"
    ) {
      return "low";
    }

    return "moderate";
  };

  return (
    <div className="crop-page">
      <div className="crop-container">

        {/* Header */}
        <div className="crop-header">
          <span className="crop-badge">
            <Sprout size={16} />
            {t(
              "services.cropRecommendation.title",
              "Crop Recommendation"
            )}
          </span>

          <h1>
            {t(
              "services.cropRecommendation.title",
              "Crop Recommendation"
            )}
          </h1>

          <p>
            {t(
              "services.cropRecommendation.description",
              "Enter your soil and climate values to get an AI-powered crop suggestion."
            )}
          </p>
        </div>

        <div className="crop-layout">

          {/* LEFT: Form */}
          <div className="crop-form-panel">

            <div className="crop-panel-heading">
              <h2>
                {t(
                  "services.cropRecommendation.soilClimateParameters",
                  "Soil & Climate Parameters"
                )}
              </h2>

              <button
                type="button"
                className="reset-link"
                onClick={handleReset}
              >
                <RotateCcw size={14} />

                {t(
                  "services.cropRecommendation.reset",
                  "Reset"
                )}
              </button>
            </div>

            {/* Quick Samples */}
            <div className="preset-row">
              <span className="preset-label">
                <Sparkles size={14} />

                {t(
                  "services.cropRecommendation.quickSamples",
                  "Quick Samples"
                )}
                :
              </span>

              {PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  className="preset-chip"
                  onClick={() => applyPreset(preset)}
                >
                  {t(
                    `services.cropRecommendation.presets.${preset.key}`,
                    `${preset.key} Profile`
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="crop-form">

              {/* Soil Section */}
              <div className="crop-section-heading">
                <Layers size={16} />

                {t(
                  "services.cropRecommendation.soilMacronutrients",
                  "Soil Macronutrients & pH"
                )}
              </div>

              <div className="crop-form-grid">

                {/* Nitrogen */}
                <div className="crop-field">
                  <label>
                    {t(
                      "services.cropRecommendation.nitrogen",
                      "Nitrogen"
                    )}{" "}
                    (N) <span>kg/ha</span>
                  </label>

                  <input
                    type="number"
                    name="nitrogen"
                    value={formValues.nitrogen}
                    onChange={handleChange}
                    required
                    min="0"
                    max="300"
                    step="any"
                  />
                </div>

                {/* Phosphorus */}
                <div className="crop-field">
                  <label>
                    {t(
                      "services.cropRecommendation.phosphorus",
                      "Phosphorus"
                    )}{" "}
                    (P) <span>kg/ha</span>
                  </label>

                  <input
                    type="number"
                    name="phosphorus"
                    value={formValues.phosphorus}
                    onChange={handleChange}
                    required
                    min="0"
                    max="300"
                    step="any"
                  />
                </div>

                {/* Potassium */}
                <div className="crop-field">
                  <label>
                    {t(
                      "services.cropRecommendation.potassium",
                      "Potassium"
                    )}{" "}
                    (K) <span>kg/ha</span>
                  </label>

                  <input
                    type="number"
                    name="potassium"
                    value={formValues.potassium}
                    onChange={handleChange}
                    required
                    min="0"
                    max="300"
                    step="any"
                  />
                </div>

                {/* Soil pH */}
                <div className="crop-field">
                  <label>
                    {t(
                      "services.cropRecommendation.soilPh",
                      "Soil pH"
                    )}{" "}
                    <span>0-14</span>
                  </label>

                  <input
                    type="number"
                    name="ph"
                    value={formValues.ph}
                    onChange={handleChange}
                    required
                    min="0"
                    max="14"
                    step="any"
                  />
                </div>
              </div>

              {/* Climate Section */}
              <div className="crop-section-heading">
                <Thermometer size={16} />

                {t(
                  "services.cropRecommendation.climateConditions",
                  "Climate & Environmental Conditions"
                )}
              </div>

              <div className="crop-form-grid">

                {/* Temperature */}
                <div className="crop-field">
                  <label>
                    {t(
                      "services.cropRecommendation.temperature",
                      "Temperature"
                    )}{" "}
                    <span>°C</span>
                  </label>

                  <input
                    type="number"
                    name="temperature"
                    value={formValues.temperature}
                    onChange={handleChange}
                    required
                    min="-10"
                    max="60"
                    step="any"
                  />
                </div>

                {/* Humidity */}
                <div className="crop-field">
                  <label>
                    {t(
                      "services.cropRecommendation.humidity",
                      "Humidity"
                    )}{" "}
                    <span>%</span>
                  </label>

                  <input
                    type="number"
                    name="humidity"
                    value={formValues.humidity}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                    step="any"
                  />
                </div>

                {/* Rainfall */}
                <div className="crop-field">
                  <label>
                    {t(
                      "services.cropRecommendation.rainfall",
                      "Rainfall"
                    )}{" "}
                    <span>mm</span>
                  </label>

                  <input
                    type="number"
                    name="rainfall"
                    value={formValues.rainfall}
                    onChange={handleChange}
                    required
                    min="0"
                    max="1000"
                    step="any"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="predict-btn"
                disabled={loading}
              >
                <Sprout size={18} />

                {loading
                  ? t(
                      "services.cropRecommendation.predicting",
                      "Predicting..."
                    )
                  : t(
                      "services.cropRecommendation.getRecommendation",
                      "Get AI Recommendation"
                    )}

                <ArrowRight size={18} />
              </button>
            </form>

            {error && (
              <div className="crop-status error">
                {error}
              </div>
            )}
          </div>

          {/* RIGHT: Result */}
          <div className="crop-result-panel">

            {/* Empty State */}
            {!result && !loading && (
              <div className="crop-result-empty">
                <FlaskConical size={36} />

                <p>
                  {t(
                    "services.cropRecommendation.emptyResult",
                    'Fill in the parameters and click "Get AI Recommendation" to see your result here.'
                  )}
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="crop-result-empty">
                <Gauge
                  size={36}
                  className="spin-icon"
                />

                <p>
                  {t(
                    "services.cropRecommendation.runningModel",
                    "Running the model..."
                  )}
                </p>
              </div>
            )}

            {/* Result */}
            {result && !loading && (
              <div className="crop-result-card">

                <span className="result-tag">
                  <Sparkles size={14} />

                  {t(
                    "services.cropRecommendation.primaryRecommendation",
                    "Primary Recommendation"
                  )}
                </span>

                <div className="crop-result-main">

                  <div className="crop-result-icon">
                    <Sprout size={26} />
                  </div>

                  <div>
                    <h2 className="crop-result-name">
                      {result.prediction.recommended_crop}
                    </h2>

                    <p className="crop-result-sub">
                      {t(
                        "services.cropRecommendation.optimalMatch",
                        "Optimal match for your input profile"
                      )}
                    </p>
                  </div>
                </div>

                {/* Confidence */}
                <div className="confidence-block">

                  <div className="confidence-row">
                    <span>
                      {t(
                        "services.cropRecommendation.modelProbability",
                        "Model Statistical Probability"
                      )}
                    </span>

                    <strong>
                      {result.prediction.confidence_pct}%
                    </strong>
                  </div>

                  <div className="confidence-track">
                    <div
                      className={`confidence-fill tier-${getConfidenceTierClass(
                        result.prediction.confidence_tier
                      )}`}
                      style={{
                        width: `${result.prediction.confidence_pct}%`,
                      }}
                    />
                  </div>

                  <span
                    className={`confidence-tier-badge tier-${getConfidenceTierClass(
                      result.prediction.confidence_tier
                    )}`}
                  >
                    {result.prediction.confidence_tier}{" "}
                    {t(
                      "services.cropRecommendation.confidenceTier",
                      "Confidence Tier"
                    )}
                  </span>
                </div>

                {/* Alternatives */}
                {result.prediction.top_alternatives?.length > 0 && (
                  <div className="crop-alternatives">

                    <h3>
                      {t(
                        "services.cropRecommendation.otherPossibleCrops",
                        "Other possible crops"
                      )}
                    </h3>

                    <div className="alternatives-grid">
                      {result.prediction.top_alternatives.map((alt) => (
                        <div
                          key={alt.crop}
                          className="alternative-chip"
                        >
                          <span>{alt.crop}</span>

                          <strong>
                            {alt.confidence_pct}%
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;