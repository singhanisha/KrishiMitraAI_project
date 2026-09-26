import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Info,
  Layers,
  MapPin,
  Calendar,
  Sprout,
  Droplets,
  FlaskConical,
  Bug,
} from "lucide-react";

import { predictCropYield } from "../services/yieldApi";
import "./YieldPrediction.css";


// ============================================================
// STATIC MODEL VALUES
// IMPORTANT:
// Keep these values in English because the backend/model expects
// the original categorical values.
// ============================================================

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const CROPS = [
  "Arecanut",
  "Arhar/Tur",
  "Bajra",
  "Banana",
  "Barley",
  "Black pepper",
  "Cardamom",
  "Cashewnut",
  "Castor seed",
  "Coconut",
  "Coriander",
  "Cotton(lint)",
  "Cowpea(Lobia)",
  "Dry chillies",
  "Garlic",
  "Ginger",
  "Gram",
  "Grapes",
  "Groundnut",
  "Guar seed",
  "Horse-gram",
  "Jowar",
  "Jute",
  "Khesari",
  "Lentil",
  "Linseed",
  "Maize",
  "Mango",
  "Masoor",
  "Mesta",
  "Moong",
  "Moong(Green Gram)",
  "Moth",
  "Mustard",
  "Niger seed",
  "Oilseeds total",
  "Onion",
  "Other  Rabi pulses",
  "Other Cereals",
  "Other Kharif pulses",
  "Other Summer Pulses",
  "Peas & beans (Pulses)",
  "Potato",
  "Ragi",
  "Rapeseed &Mustard",
  "Rice",
  "Rubber",
  "Safflower",
  "Sannhamp",
  "Sesamum",
  "Small millets",
  "Soyabean",
  "Sugarcane",
  "Sunflower",
  "Sweet potato",
  "Tapioca",
  "Tobacco",
  "Tomato",
  "Turmeric",
  "Urad",
  "Wheat",
  "other oilseeds",
];

const SEASONS = [
  "Autumn",
  "Kharif",
  "Rabi",
  "Summer",
  "Whole Year",
  "Winter",
];


// ============================================================
// QUICK SAMPLE PROFILES
// Model values remain in English.
// Only display text is translated.
// ============================================================

const PRESETS = [
  {
    nameKey: "wheatPunjab",
    badgeKey: "wheatBadge",

    data: {
      year: 2024,
      state: "Punjab",
      crop: "Wheat",
      season: "Rabi",
      area: 2500,
      annual_rainfall: 650,
      fertilizer: 350000,
      pesticide: 950,
    },
  },

  {
    nameKey: "jowarWestBengal",
    badgeKey: "jowarBadge",

    data: {
      year: 2024,
      state: "West Bengal",
      crop: "Jowar",
      season: "Kharif",
      area: 600,
      annual_rainfall: 1650,
      fertilizer: 99000,
      pesticide: 260,
    },
  },

  {
    nameKey: "sweetPotatoMeghalaya",
    badgeKey: "sweetPotatoBadge",

    data: {
      year: 2024,
      state: "Meghalaya",
      crop: "Sweet potato",
      season: "Whole Year",
      area: 4400,
      annual_rainfall: 3200,
      fertilizer: 740000,
      pesticide: 1750,
    },
  },

  {
    nameKey: "coconutAndhra",
    badgeKey: "coconutBadge",

    data: {
      year: 2024,
      state: "Andhra Pradesh",
      crop: "Coconut",
      season: "Whole Year",
      area: 95000,
      annual_rainfall: 1050,
      fertilizer: 12000000,
      pesticide: 30000,
    },
  },
];


// ============================================================
// INITIAL FORM
// ============================================================

const INITIAL_FORM = {
  year: 2024,
  state: "",
  crop: "",
  season: "",
  area: "",
  annual_rainfall: "",
  fertilizer: "",
  pesticide: "",
};


// ============================================================
// COMPONENT
// ============================================================

function YieldPrediction() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [result, setResult] = useState(null);


  // ============================================================
  // VALIDATION
  // ============================================================

  const validateField = (name, value) => {
    if (value === "" || value === null || value === undefined) {
      return t("services.yieldPrediction.required");
    }

    // Dropdown fields
    if (
      name === "state" ||
      name === "crop" ||
      name === "season"
    ) {
      if (typeof value !== "string" || !value.trim()) {
        return t("services.yieldPrediction.invalidOption");
      }

      return null;
    }

    const num = Number(value);

    if (isNaN(num)) {
      return t("services.yieldPrediction.validNumber");
    }

    switch (name) {
      case "year":
        if (num < 0) {
          return t("services.yieldPrediction.yearNegative");
        }

        if (num < 1990 || num > 2035) {
          return t("services.yieldPrediction.yearRange");
        }

        break;

      case "area":
        if (num < 0) {
          return t("services.yieldPrediction.areaNegative");
        }

        if (num === 0) {
          return t("services.yieldPrediction.areaZero");
        }

        break;

      case "annual_rainfall":
        if (num < 0) {
          return t("services.yieldPrediction.rainfallNegative");
        }

        break;

      case "fertilizer":
        if (num < 0) {
          return t("services.yieldPrediction.fertilizerNegative");
        }

        break;

      case "pesticide":
        if (num < 0) {
          return t("services.yieldPrediction.pesticideNegative");
        }

        break;

      default:
        break;
    }

    return null;
  };


  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      const fieldError = validateField(name, value);

      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }

    if (apiError) {
      setApiError(null);
    }
  };


  // ============================================================
  // HANDLE BLUR
  // ============================================================

  const handleBlur = (e) => {
    const { name, value } = e.target;

    const fieldError = validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };


  // ============================================================
  // PRESET SELECT
  // ============================================================

  const handlePresetSelect = (preset) => {
    setFormData({
      ...preset.data,
    });

    setErrors({});
    setApiError(null);
    setResult(null);
  };


  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setApiError(null);
    setResult(null);
  };


  // ============================================================
  // VALIDATE ALL
  // ============================================================

  const validateAll = () => {
    const newErrors = {};

    Object.keys(INITIAL_FORM).forEach((key) => {
      const error = validateField(key, formData[key]);

      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };


  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setApiError(null);

    const {
      isValid,
      errors: validationErrors,
    } = validateAll();

    if (!isValid) {
      const firstErrorKey =
        Object.keys(validationErrors)[0];

      const el = document.querySelector(
        `[name="${firstErrorKey}"]`
      );

      if (el) {
        el.focus();
      }

      return;
    }

    setLoading(true);

    try {
      const data = await predictCropYield(formData);

      setResult(data);

      setTimeout(() => {
        const resElem = document.getElementById(
          "yield-result-section"
        );

        if (resElem) {
          resElem.scrollIntoView({
            behavior: "smooth",
          });
        }
      }, 100);

    } catch (err) {
      setApiError(
        err.message ||
          t(
            "services.yieldPrediction.defaultApiError",
            "Failed to predict crop yield. Please try again."
          )
      );
    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="yield-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="yield-header">

        <div className="yield-title-wrap">

          <div className="yield-badge">
            <Sparkles size={16} />

            <span>
              {t(
                "services.yieldPrediction.aiAnalytics"
              )}
            </span>
          </div>

          <h1 className="yield-title">
            {t(
              "services.yieldPrediction.title"
            )}
          </h1>

          <p className="yield-subtitle">
            {t(
              "services.yieldPrediction.subtitle"
            )}
          </p>

        </div>
      </div>


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="yield-content-container">


        {/* ====================================================
            QUICK SAMPLE PROFILES
        ==================================================== */}

        <div className="yield-presets-box">

          <div className="presets-header">

            <Layers size={18} />

            <span>
              {t(
                "services.yieldPrediction.quickSamples"
              )}
            </span>

          </div>


          <div className="presets-grid">

            {PRESETS.map((preset, idx) => (

              <button
                key={idx}
                type="button"
                className="preset-btn"
                onClick={() =>
                  handlePresetSelect(preset)
                }
              >

                <span className="preset-name">
                  {t(
                    `services.yieldPrediction.presets.${preset.nameKey}`
                  )}
                </span>

                <span className="preset-badge">
                  {t(
                    `services.yieldPrediction.presets.${preset.badgeKey}`
                  )}
                </span>

              </button>

            ))}

          </div>
        </div>


        {/* ====================================================
            API ERROR
        ==================================================== */}

        {apiError && (

          <div
            className="yield-error-banner"
            role="alert"
          >

            <AlertCircle size={20} />

            <div className="yield-error-content">

              <strong>
                {t(
                  "services.yieldPrediction.predictionRequestNotice"
                )}
              </strong>

              <p>{apiError}</p>

            </div>

            <button
              type="button"
              className="error-dismiss-btn"
              onClick={() =>
                setApiError(null)
              }
            >
              ×
            </button>

          </div>

        )}


        {/* ====================================================
            FORM CARD
        ==================================================== */}

        <div className="yield-form-card">

          <form
            onSubmit={handleSubmit}
            noValidate
          >

            {/* FORM TITLE */}

            <div className="form-section-title">

              <Sprout size={20} />

              <h3>
                {t(
                  "services.yieldPrediction.farmParameters"
                )}
              </h3>

            </div>


            {/* ==================================================
                FORM GRID
            ================================================== */}

            <div className="form-grid">


              {/* YEAR */}

              <div className="form-group">

                <label htmlFor="year">
                  <Calendar size={15} />

                  {t(
                    "services.yieldPrediction.harvestYear"
                  )}
                </label>

                <input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t(
                    "services.yieldPrediction.placeholders.year"
                  )}
                  className={
                    errors.year
                      ? "input-error"
                      : ""
                  }
                />

                {errors.year && (
                  <span className="field-error">
                    {errors.year}
                  </span>
                )}

              </div>


              {/* STATE */}

              <div className="form-group">

                <label htmlFor="state">
                  <MapPin size={15} />

                  {t(
                    "services.yieldPrediction.state"
                  )}
                </label>

                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.state
                      ? "input-error"
                      : ""
                  }
                >

                  <option value="">
                    {t(
                      "services.yieldPrediction.selectState"
                    )}
                  </option>

                  {STATES.map((state) => (

                    <option
                      key={state}
                      value={state}
                    >
                      {state}
                    </option>

                  ))}

                </select>

                {errors.state && (
                  <span className="field-error">
                    {errors.state}
                  </span>
                )}

              </div>


              {/* CROP */}

              <div className="form-group">

                <label htmlFor="crop">
                  <Sprout size={15} />

                  {t(
                    "services.yieldPrediction.crop"
                  )}
                </label>

                <select
                  id="crop"
                  name="crop"
                  value={formData.crop}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.crop
                      ? "input-error"
                      : ""
                  }
                >

                  <option value="">
                    {t(
                      "services.yieldPrediction.selectCrop"
                    )}
                  </option>

                  {CROPS.map((crop) => (

                    <option
                      key={crop}
                      value={crop}
                    >
                      {crop}
                    </option>

                  ))}

                </select>

                {errors.crop && (
                  <span className="field-error">
                    {errors.crop}
                  </span>
                )}

              </div>


              {/* SEASON */}

              <div className="form-group">

                <label htmlFor="season">
                  <Calendar size={15} />

                  {t(
                    "services.yieldPrediction.season"
                  )}
                </label>

                <select
                  id="season"
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.season
                      ? "input-error"
                      : ""
                  }
                >

                  <option value="">
                    {t(
                      "services.yieldPrediction.selectSeason"
                    )}
                  </option>

                  {SEASONS.map((season) => (

                    <option
                      key={season}
                      value={season}
                    >
                      {season}
                    </option>

                  ))}

                </select>

                {errors.season && (
                  <span className="field-error">
                    {errors.season}
                  </span>
                )}

              </div>


              {/* AREA */}

              <div className="form-group">

                <label htmlFor="area">
                  <Layers size={15} />

                  {t(
                    "services.yieldPrediction.cultivatedArea"
                  )}
                </label>

                <input
                  id="area"
                  name="area"
                  type="number"
                  step="any"
                  value={formData.area}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t(
                    "services.yieldPrediction.placeholders.area"
                  )}
                  className={
                    errors.area
                      ? "input-error"
                      : ""
                  }
                />

                {errors.area && (
                  <span className="field-error">
                    {errors.area}
                  </span>
                )}

              </div>


              {/* RAINFALL */}

              <div className="form-group">

                <label htmlFor="annual_rainfall">
                  <Droplets size={15} />

                  {t(
                    "services.yieldPrediction.annualRainfall"
                  )}
                </label>

                <input
                  id="annual_rainfall"
                  name="annual_rainfall"
                  type="number"
                  step="any"
                  value={
                    formData.annual_rainfall
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t(
                    "services.yieldPrediction.placeholders.rainfall"
                  )}
                  className={
                    errors.annual_rainfall
                      ? "input-error"
                      : ""
                  }
                />

                {errors.annual_rainfall && (
                  <span className="field-error">
                    {errors.annual_rainfall}
                  </span>
                )}

              </div>


              {/* FERTILIZER */}

              <div className="form-group">

                <label htmlFor="fertilizer">
                  <FlaskConical size={15} />

                  {t(
                    "services.yieldPrediction.fertilizerApplied"
                  )}
                </label>

                <input
                  id="fertilizer"
                  name="fertilizer"
                  type="number"
                  step="any"
                  value={formData.fertilizer}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t(
                    "services.yieldPrediction.placeholders.fertilizer"
                  )}
                  className={
                    errors.fertilizer
                      ? "input-error"
                      : ""
                  }
                />

                {errors.fertilizer && (
                  <span className="field-error">
                    {errors.fertilizer}
                  </span>
                )}

              </div>


              {/* PESTICIDE */}

              <div className="form-group">

                <label htmlFor="pesticide">
                  <Bug size={15} />

                  {t(
                    "services.yieldPrediction.pesticideApplied"
                  )}
                </label>

                <input
                  id="pesticide"
                  name="pesticide"
                  type="number"
                  step="any"
                  value={formData.pesticide}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t(
                    "services.yieldPrediction.placeholders.pesticide"
                  )}
                  className={
                    errors.pesticide
                      ? "input-error"
                      : ""
                  }
                />

                {errors.pesticide && (
                  <span className="field-error">
                    {errors.pesticide}
                  </span>
                )}

              </div>

            </div>


            {/* ==================================================
                ACTION BUTTONS
            ================================================== */}

            <div className="yield-form-actions">

              <button
                type="button"
                className="reset-btn"
                onClick={handleReset}
              >
                <RotateCcw size={16} />

                {t(
                  "services.yieldPrediction.resetForm"
                )}
              </button>


              <button
                type="submit"
                className="predict-btn"
                disabled={loading}
              >

                {loading ? (

                  <>
                    <Sparkles size={17} />

                    {t(
                      "services.yieldPrediction.predictingYield"
                    )}
                  </>

                ) : (

                  <>
                    <Sparkles size={17} />

                    {t(
                      "services.yieldPrediction.button"
                    )}

                    <ArrowRight size={17} />

                  </>

                )}

              </button>

            </div>

          </form>

        </div>


        {/* ====================================================
            RESULT SECTION
        ==================================================== */}

        {result && (

          <div
            id="yield-result-section"
            className="yield-result-section"
          >

            {/* RESULT HEADER */}

            <div className="result-header">

              <div className="result-success-icon">
                <CheckCircle2 size={24} />
              </div>

              <div>

                <h2>
                  {t(
                    "services.yieldPrediction.predictionReady"
                  )}
                </h2>

                <p>
                  {t(
                    "services.yieldPrediction.model"
                  )}
                </p>

              </div>

            </div>


            {/* PREDICTED YIELD */}

            <div className="predicted-yield-card">

              <div className="predicted-yield-label">
                {t(
                  "services.yieldPrediction.predictedYield"
                )}
              </div>

              <div className="predicted-yield-value">
                {result.predicted_yield ??
                  result.predictedYield ??
                  result.yield ??
                  "--"}
              </div>

              {result.unit && (
                <div className="predicted-yield-unit">
                  {result.unit}
                </div>
              )}

            </div>


            {/* DISCLAIMER */}

            <div className="yield-disclaimer">

              <Info size={17} />

              <span>
                {t(
                  "services.yieldPrediction.disclaimer"
                )}
              </span>

            </div>


            {/* RESULT DETAILS */}

            <div className="yield-result-details">

              <div className="result-detail-item">

                <span className="detail-label">
                  {t(
                    "services.yieldPrediction.crop"
                  )}
                </span>

                <strong>
                  {result.crop || formData.crop}
                </strong>

              </div>


              <div className="result-detail-item">

                <span className="detail-label">
                  {t(
                    "services.yieldPrediction.state"
                  )}
                </span>

                <strong>
                  {result.state || formData.state}
                </strong>

              </div>


              <div className="result-detail-item">

                <span className="detail-label">
                  {t(
                    "services.yieldPrediction.season"
                  )}
                </span>

                <strong>
                  {result.season || formData.season}
                </strong>

              </div>


              <div className="result-detail-item">

                <span className="detail-label">
                  {t(
                    "services.yieldPrediction.area"
                  )}
                </span>

                <strong>
                  {result.area ?? formData.area}
                </strong>

                <span>
                  {" "}
                  {t(
                    "services.yieldPrediction.hectares"
                  )}
                </span>

              </div>

            </div>


            {/* ==================================================
                YIELD TIP
            ================================================== */}

            <div className="yield-tip-box">

              <div className="yield-tip-icon">
                <Sparkles size={18} />
              </div>

              <div>

                <strong>
                  {t(
                    "services.yieldPrediction.yieldMaximizationTip"
                  )}
                </strong>

                <p>
                  {t(
                    "services.yieldPrediction.yieldTip",
                    {
                      crop:
                        result.crop ||
                        formData.crop,
                    }
                  )}
                </p>

              </div>

            </div>


            {/* ==================================================
                RESULT ACTIONS
            ================================================== */}

            <div className="result-actions">

              <Link
                to="/"
                className="back-home-btn"
              >
                <ArrowLeft size={17} />

                {t(
                  "services.yieldPrediction.backHome"
                )}
              </Link>


              <button
                type="button"
                className="predict-another-btn"
                onClick={() => {
                  handleReset();

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              >

                <RotateCcw size={17} />

                {t(
                  "services.yieldPrediction.predictAnother"
                )}

              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default YieldPrediction;