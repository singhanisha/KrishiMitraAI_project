import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Sprout,
  ShieldAlert,
  Droplets,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Target,
  ArrowRight,
} from "lucide-react";
import insightSoilImage from "../assets/insightsoil_image.png";
import insightDiseaseImage from "../assets/insightdisease_image.png";
import insightWaterImage from "../assets/insightwater_image.png";

import "./css/ContentPages.css";

const TOPIC_CONFIG = {
  soil: {
    icon: Sprout,
    image: insightSoilImage,
    colorClass: "topic-soil",
  },

  disease: {
    icon: ShieldAlert,
    image: insightDiseaseImage,
    colorClass: "topic-disease",
  },

  water: {
    icon: Droplets,
    image: insightWaterImage,
    colorClass: "topic-water",
  },
};

const InsightDetail = () => {
  const { topic } = useParams();
  const { t } = useTranslation();

  const config = TOPIC_CONFIG[topic] || TOPIC_CONFIG.soil;
  const Icon = config.icon;

  const sections = t(`insightDetail.${topic}.sections`, {
    returnObjects: true,
  });

  const quickFacts = t(`insightDetail.${topic}.quickFacts`, {
    returnObjects: true,
  });

  const doList = t(`insightDetail.${topic}.doList`, {
    returnObjects: true,
  });

  const avoidList = t(`insightDetail.${topic}.avoidList`, {
    returnObjects: true,
  });

  return (
    <main className={`insight-page ${config.colorClass}`}>

      <div className="insight-container">

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="insight-hero">

          <img
            src={config.image}
            alt={t(`insightDetail.${topic}.title`)}
            className="insight-hero-image"
          />

          <div className="insight-hero-overlay" />

          <div className="insight-hero-content">

            <div className="insight-topic-icon">
              <Icon size={28} />
            </div>

            <span className="insight-badge">
              {t(`insightDetail.${topic}.badge`)}
            </span>

            <h1>
              {t(`insightDetail.${topic}.title`)}
            </h1>

            <p>
              {t(`insightDetail.${topic}.intro`)}
            </p>

          </div>

        </section>

        {/* =====================================================
            QUICK FACTS
        ====================================================== */}

        <section className="quick-facts">

          {Array.isArray(quickFacts) &&
            quickFacts.map((fact, index) => (
              <div className="quick-fact" key={index}>

                <div className="quick-fact-icon">
                  <Target size={19} />
                </div>

                <div>
                  <strong>{fact.value}</strong>
                  <span>{fact.label}</span>
                </div>

              </div>
            ))}

        </section>

        {/* =====================================================
            INTRO / WHY IT MATTERS
        ====================================================== */}

        <section className="why-section">

          <div className="section-label">
            {t(
              `insightDetail.${topic}.whyLabel`,
              "Why It Matters"
            )}
          </div>

          <div className="why-content">

            <h2>
              {t(
                `insightDetail.${topic}.whyTitle`
              )}
            </h2>

            <p>
              {t(
                `insightDetail.${topic}.whyDescription`
              )}
            </p>

          </div>

        </section>

        {/* =====================================================
            MAIN PRACTICES
        ====================================================== */}

        <section className="practices-section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                {t(
                  `insightDetail.${topic}.guideLabel`,
                  "Farmer's Guide"
                )}
              </span>

              <h2>
                {t(
                  `insightDetail.${topic}.guideTitle`
                )}
              </h2>
            </div>

            <p>
              {t(
                `insightDetail.${topic}.guideDescription`
              )}
            </p>

          </div>

          <div className="practice-list">

            {Array.isArray(sections) &&
              sections.map((section, index) => (
                <article
                  className="practice-item"
                  key={index}
                >

                  <div className="practice-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="practice-line" />

                  <div className="practice-content">

                    <div className="practice-title-row">

                      <h3>{section.title}</h3>

                      <CheckCircle2
                        size={20}
                        className="practice-check"
                      />

                    </div>

                    <p>
                      {section.description}
                    </p>

                    {section.tip && (
                      <div className="practice-tip">
                        <Lightbulb size={16} />
                        <span>{section.tip}</span>
                      </div>
                    )}

                  </div>

                </article>
              ))}

          </div>

        </section>

        {/* =====================================================
            DO / AVOID
        ====================================================== */}

        <section className="do-avoid-grid">

          <div className="action-card do-card">

            <div className="action-card-header">

              <div className="action-icon">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <span>
                  {t(
                    "insightDetail.do",
                    "Do This"
                  )}
                </span>

                <h3>
                  {t(
                    `insightDetail.${topic}.doTitle`
                  )}
                </h3>
              </div>

            </div>

            <ul>
              {Array.isArray(doList) &&
                doList.map((item, index) => (
                  <li key={index}>
                    <CheckCircle2 size={16} />
                    <span>{item}</span>
                  </li>
                ))}
            </ul>

          </div>

          <div className="action-card avoid-card">

            <div className="action-card-header">

              <div className="action-icon">
                <AlertTriangle size={21} />
              </div>

              <div>
                <span>
                  {t(
                    "insightDetail.avoid",
                    "Avoid This"
                  )}
                </span>

                <h3>
                  {t(
                    `insightDetail.${topic}.avoidTitle`
                  )}
                </h3>
              </div>

            </div>

            <ul>
              {Array.isArray(avoidList) &&
                avoidList.map((item, index) => (
                  <li key={index}>
                    <AlertTriangle size={16} />
                    <span>{item}</span>
                  </li>
                ))}
            </ul>

          </div>

        </section>

        {/* =====================================================
            FARMER TIP
        ====================================================== */}

        <section className="farmer-tip">

          <div className="farmer-tip-icon">
            <Lightbulb size={25} />
          </div>

          <div className="farmer-tip-content">

            <span>
              {t(
                "insightDetail.farmerTip",
                "Farmer Tip"
              )}
            </span>

            <p>
              {t(
                `insightDetail.${topic}.farmerTip`
              )}
            </p>

          </div>

          <ArrowRight
            size={24}
            className="farmer-tip-arrow"
          />

        </section>

        {/* =====================================================
            KEY TAKEAWAY
        ====================================================== */}

        <section className="final-takeaway">

          <div className="final-takeaway-icon">
            <Icon size={28} />
          </div>

          <div>

            <span>
              {t(
                "insightDetail.keyTakeaway",
                "Key Takeaway"
              )}
            </span>

            <h2>
              {t(
                `insightDetail.${topic}.takeaway`
              )}
            </h2>

          </div>

        </section>

      </div>

    </main>
  );
};

export default InsightDetail;