import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  ChevronRight,
  Sparkles,
  Check,
  CheckCircle2,
  ShieldCheck,
  Sprout,
  Cpu,
  FlaskConical,
  Database,
  ScanLine,
  CloudSun,
  BarChart3,
} from "lucide-react";

import cropIcon from "../assets/cropRecommendation_image.png";
import soilIcon from "../assets/soilanalysis_image.png";
import marketIcon from "../assets/marketprice_image.png";
import diseaseIcon from "../assets/diseasedetection_image.png";
import weatherIcon from "../assets/weatherforecast_image.png";
import yieldIcon from "../assets/yieldprediction_image.png";
import leavesImage from "../assets/leaves_image.png";

import "./Services.css";

/* =========================================================
   SERVICES CONFIGURATION
   ========================================================= */

const SERVICES_DATA = [
  {
    id: "crop",
    image: cropIcon,
    iconComponent: Cpu,
  },
  {
    id: "soil",
    image: soilIcon,
    iconComponent: FlaskConical,
  },
  {
    id: "market",
    image: marketIcon,
    iconComponent: Database,
  },
  {
    id: "disease",
    image: diseaseIcon,
    iconComponent: ScanLine,
  },
  {
    id: "weather",
    image: weatherIcon,
    iconComponent: CloudSun,
  },
  {
    id: "yield",
    image: yieldIcon,
    iconComponent: BarChart3,
  },
];

const LIFECYCLE_STEPS = [
  {
    step: "01",
    key: "preSowing",
  },
  {
    step: "02",
    key: "growth",
  },
  {
    step: "03",
    key: "harvest",
  },
  {
    step: "04",
    key: "selling",
  },
];

function Services() {
  const { t } = useTranslation();

  return (
    <main className="kmasvc1-page">

      {/* =====================================================
          HEADER / HERO
          ===================================================== */}

      <header className="kmasvc1-header">

        <div className="kmasvc1-hero">

          <div className="kmasvc1-hero-badge">
            <Sparkles size={15} />

            <span>
              {t("servicesPage.badge")}
            </span>
          </div>

          <h1>
            {t("servicesPage.title")}
          </h1>

          <p>
            {t("servicesPage.lead")}
          </p>

          <div className="kmasvc1-hero-points">

            <span>
              <CheckCircle2 size={15} />
              {t("servicesPage.heroPoints.farmer")}
            </span>

            <span>
              <CheckCircle2 size={15} />
              {t("servicesPage.heroPoints.data")}
            </span>

            <span>
              <CheckCircle2 size={15} />
              {t("servicesPage.heroPoints.multilingual")}
            </span>

          </div>

        </div>

      </header>


      {/* =====================================================
          CORE MODULES
          ===================================================== */}

      <section className="kmasvc1-modules">

        <div className="kmasvc1-section-heading">

          <span className="kmasvc1-section-tag">
            {t("servicesPage.modulesTag")}
          </span>

          <h2>
            {t("servicesPage.modulesTitle")}
          </h2>

          <p>
            {t("servicesPage.modulesLead")}
          </p>

        </div>


        <div className="kmasvc1-grid">

          {SERVICES_DATA.map((service, index) => {

            const Icon = service.iconComponent;

            const servicePath =
              `servicesPage.modules.${service.id}`;

            const statusKey = t(
              `${servicePath}.status`
            );

            let statusClass = "kmasvc1-status";

            if (statusKey === "available") {
              statusClass += " kmasvc1-status-available";
            }

            if (statusKey === "developed") {
              statusClass += " kmasvc1-status-developed";
            }

            if (statusKey === "planned") {
              statusClass += " kmasvc1-status-planned";
            }

            return (

              <article
                key={service.id}
                className="kmasvc1-card"
              >

                {/* CARD TOP */}

                <div className="kmasvc1-card-top">

                  <div className="kmasvc1-image-box">

                    <img
                      src={service.image}
                      alt={t(
                        `${servicePath}.name`
                      )}
                    />

                  </div>


                  <span className={statusClass}>
                    {t(`servicesPage.status.${statusKey}`)}
                  </span>

                </div>


                {/* CARD CONTENT */}

                <div className="kmasvc1-card-content">

                  <span className="kmasvc1-category">
                    {t(
                      `${servicePath}.category`
                    )}
                  </span>


                  <h3>
                    {t(
                      `${servicePath}.name`
                    )}
                  </h3>


                  <p>
                    {t(
                      `${servicePath}.description`
                    )}
                  </p>


                  <div className="kmasvc1-features">

                    {[0, 1, 2].map((item) => (

                      <div
                        key={item}
                        className="kmasvc1-feature"
                      >

                        <Check
                          size={14}
                          className="kmasvc1-feature-check"
                        />

                        <span>
                          {t(
                            `${servicePath}.features.${item}`
                          )}
                        </span>

                      </div>

                    ))}

                  </div>

                </div>


                {/* CARD FOOTER */}

                <div className="kmasvc1-card-footer">

                  <span className="kmasvc1-info">

                    <Icon size={14} />

                    {t(
                      `${servicePath}.info`
                    )}

                  </span>


                  <span className="kmasvc1-number">

                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}

                  </span>

                </div>

              </article>

            );

          })}

        </div>

      </section>


      {/* =====================================================
          FARMING LIFECYCLE
          ===================================================== */}

      <section className="kmasvc1-lifecycle">

        <div className="kmasvc1-lifecycle-card">

          <img
            src={leavesImage}
            alt=""
            aria-hidden="true"
            className="kmasvc1-lifecycle-leaves"
          />


          <div className="kmasvc1-section-heading kmasvc1-lifecycle-heading">

            <span className="kmasvc1-section-tag">
              {t("servicesPage.workflowTag")}
            </span>


            <h2>
              {t("servicesPage.workflowTitle")}
            </h2>


            <p>
              {t("servicesPage.workflowLead")}
            </p>

          </div>


          <div className="kmasvc1-lifecycle-grid">

            {LIFECYCLE_STEPS.map((item) => (

              <article
                key={item.key}
                className="kmasvc1-lifecycle-step"
              >

                <div className="kmasvc1-step-number">
                  {item.step}
                </div>


                <span className="kmasvc1-step-phase">

                  {t(
                    `servicesPage.workflow.${item.key}.phase`
                  )}

                </span>


                <h3>

                  {t(
                    `servicesPage.workflow.${item.key}.title`
                  )}

                </h3>


                <p>

                  {t(
                    `servicesPage.workflow.${item.key}.description`
                  )}

                </p>

              </article>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          PLATFORM HIGHLIGHTS
          ===================================================== */}

      <section className="kmasvc1-highlights">

        <div className="kmasvc1-highlights-content">

          <span className="kmasvc1-highlight-tag">
            {t("servicesPage.highlightsTag")}
          </span>


          <h2>
            {t("servicesPage.highlightsTitle")}
          </h2>


          <p>
            {t("servicesPage.highlightsText")}
          </p>

        </div>


        <div className="kmasvc1-trust-grid">


          {/* DATA & AI */}

          <div className="kmasvc1-trust-item">

            <div className="kmasvc1-trust-icon">
              <Cpu size={19} />
            </div>


            <div>

              <h3>
                {t(
                  "servicesPage.trust.ml.title"
                )}
              </h3>


              <p>
                {t(
                  "servicesPage.trust.ml.text"
                )}
              </p>

            </div>

          </div>


          {/* MARKET */}

          <div className="kmasvc1-trust-item">

            <div className="kmasvc1-trust-icon">
              <ShieldCheck size={19} />
            </div>


            <div>

              <h3>
                {t(
                  "servicesPage.trust.market.title"
                )}
              </h3>


              <p>
                {t(
                  "servicesPage.trust.market.text"
                )}
              </p>

            </div>

          </div>


          {/* LANGUAGE */}

          <div className="kmasvc1-trust-item">

            <div className="kmasvc1-trust-icon">
              <LanguagesIcon />
            </div>


            <div>

              <h3>
                {t(
                  "servicesPage.trust.language.title"
                )}
              </h3>


              <p>
                {t(
                  "servicesPage.trust.language.text"
                )}
              </p>

            </div>

          </div>


          {/* FARMER */}

          <div className="kmasvc1-trust-item">

            <div className="kmasvc1-trust-icon">
              <Sprout size={19} />
            </div>


            <div>

              <h3>
                {t(
                  "servicesPage.trust.farmer.title"
                )}
              </h3>


              <p>
                {t(
                  "servicesPage.trust.farmer.text"
                )}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          CLOSING CTA
          ===================================================== */}

      <section className="kmasvc1-closing">

        <div className="kmasvc1-closing-content">

          <span className="kmasvc1-closing-label">

            {t(
              "services.closingTag"
            )}

          </span>


          <h2>

            {t(
              "servicesPage.closingTitle"
            )}

          </h2>


          <p>

            {t(
              "servicesPage.closingText"
            )}

          </p>

        </div>


        <Link
          to="/"
          className="kmasvc1-home-button"
        >

          {t(
            "servicesPage.homeButton"
          )}

          <ChevronRight size={17} />

        </Link>

      </section>

    </main>
  );
}


/* =========================================================
   SMALL LANGUAGE ICON
   ========================================================= */

function LanguagesIcon() {

  return (

    <span className="kmasvc1-language-icon">
      A
    </span>

  );

}


export default Services;