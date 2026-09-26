import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  ArrowRight,
  Sprout,
  Target,
  Languages,
  Cpu,
  Database,
  Smartphone,
  TrendingUp,
  FlaskConical,
  Users,
  CloudSun,
  ScanLine,
  BarChart3,
  Layers,
} from "lucide-react";

import farmerImage from "../assets/Farmer_Image.png";
import cropIcon from "../assets/cropRecommendation_image.png";
import soilIcon from "../assets/soilanalysis_image.png";
import marketIcon from "../assets/marketprice_image.png";
import weatherIcon from "../assets/weatherforecast_image.png";
import diseaseIcon from "../assets/diseasedetection_image.png";
import yieldIcon from "../assets/yieldprediction_image.png";

import "./About.css";

const REGIONAL_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी" },
  { code: "bn", name: "বাংলা" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "ta", name: "தமிழ்" },
  { code: "mr", name: "मराठी" },
  { code: "te", name: "తెలుగు" },
  { code: "ml", name: "മലയാളം" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "or", name: "ଓଡ଼ିଆ" },
  { code: "gu", name: "ગુજરાતી" },
];

function About() {
  const { t } = useTranslation();

  const services = [
    {
      key: "crop",
      image: cropIcon,
      icon: Sprout,
    },
    {
      key: "soil",
      image: soilIcon,
      icon: FlaskConical,
    },
    {
      key: "market",
      image: marketIcon,
      icon: TrendingUp,
    },
    {
      key: "disease",
      image: diseaseIcon,
      icon: ScanLine,
    },
    {
      key: "weather",
      image: weatherIcon,
      icon: CloudSun,
    },
    {
      key: "yield",
      image: yieldIcon,
      icon: BarChart3,
    },
  ];

  return (
    <main className="km-about-page">

      {/* ================= STORY ================= */}

      <section className="km-about-story">
        <div className="km-about-story-image">
          <img
            src={farmerImage}
            alt={t("about.alt.story", "Indian farmer")}
          />
        </div>

        <div className="km-about-story-content">
          <span className="km-about-label">
            {t("about.storyTag", "Our Story")}
          </span>

          <h2>
            {t(
              "about.storyTitle",
              "Making agricultural technology easier to use."
            )}
          </h2>

          <p>
            {t(
              "about.storyP1",
              "Farmers make important decisions every day — from choosing a crop and understanding soil conditions to planning irrigation and checking market prices."
            )}
          </p>

          <p>
            {t(
              "about.storyP2",
              "KrishiMitra AI was designed to bring these different sources of information into one farmer-friendly platform, reducing the need to search across multiple applications."
            )}
          </p>

          <div className="km-about-story-points">

            <div>
              <span className="km-about-point-number">01</span>

              <div>
                <h4>
                  {t(
                    "about.highlights.oneTitle",
                    "Simple Information"
                  )}
                </h4>

                <p>
                  {t(
                    "about.highlights.oneText",
                    "Complex agricultural information is presented in an easier form."
                  )}
                </p>
              </div>
            </div>

            <div>
              <span className="km-about-point-number">02</span>

              <div>
                <h4>
                  {t(
                    "about.highlights.twoTitle",
                    "Data-Based Support"
                  )}
                </h4>

                <p>
                  {t(
                    "about.highlights.twoText",
                    "Agricultural decisions can be supported using data and intelligent models."
                  )}
                </p>
              </div>
            </div>

            <div>
              <span className="km-about-point-number">03</span>

              <div>
                <h4>
                  {t(
                    "about.highlights.threeTitle",
                    "Regional Languages"
                  )}
                </h4>

                <p>
                  {t(
                    "about.highlights.threeText",
                    "Information can be accessed in multiple Indian languages."
                  )}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= PURPOSE ================= */}

      <section className="km-about-section">

        <div className="km-about-heading">

          <span className="km-about-label">
            {t("about.purposeTag", "Our Purpose")}
          </span>

          <h2>
            {t(
              "about.purposeTitle",
              "Technology with a practical purpose"
            )}
          </h2>

          <p>
            {t(
              "about.purposeLead",
              "KrishiMitra AI focuses on making useful agricultural technology understandable and accessible."
            )}
          </p>

        </div>

        <div className="km-about-purpose-grid">

          {/* CARD 1 */}

          <article className="km-about-purpose-card">

            <div className="km-about-purpose-icon">
              <Target size={22} />
            </div>

            <span className="km-about-card-number">
              01
            </span>

            <h3>
              {t(
                "about.purpose.cards.dataTitle",
                "Useful Data"
              )}
            </h3>

            <p>
              {t(
                "about.purpose.cards.dataText",
                "Convert agricultural data into information that farmers can understand and use."
              )}
            </p>

          </article>

          {/* CARD 2 */}

          <article className="km-about-purpose-card">

            <div className="km-about-purpose-icon">
              <Sprout size={22} />
            </div>

            <span className="km-about-card-number">
              02
            </span>

            <h3>
              {t(
                "about.purpose.cards.riskTitle",
                "Better Decisions"
              )}
            </h3>

            <p>
              {t(
                "about.purpose.cards.riskText",
                "Provide data-supported insights for crop, soil and farming-related decisions."
              )}
            </p>

          </article>

          {/* CARD 3 */}

          <article className="km-about-purpose-card">

            <div className="km-about-purpose-icon">
              <TrendingUp size={22} />
            </div>

            <span className="km-about-card-number">
              03
            </span>

            <h3>
              {t(
                "about.purpose.cards.marketTitle",
                "Market Awareness"
              )}
            </h3>

            <p>
              {t(
                "about.purpose.cards.marketText",
                "Make agricultural market information easier to access and understand."
              )}
            </p>

          </article>

        </div>
      </section>

      {/* ================= SERVICES ================= */}

      <section className="km-about-section km-about-services-section">

        <div className="km-about-heading">

          <span className="km-about-label">
            {t("about.featuresTag", "What We Provide")}
          </span>

          <h2>
            {t(
              "about.featuresTitle",
              "Agriculture tools in one place"
            )}
          </h2>

          <p>
            {t(
              "about.featuresLead",
              "KrishiMitra AI combines different agricultural capabilities into one connected platform."
            )}
          </p>

        </div>

        <div className="km-about-services-grid">

          {services.map(({ key, image, icon: Icon }) => (

            <article
              className="km-about-service-card"
              key={key}
            >

              <div className="km-about-service-image">

                <img
                  src={image}
                  alt={t(`about.services.${key}.title`)}
                />

                <div className="km-about-service-icon">
                  <Icon size={18} />
                </div>

              </div>

              <div className="km-about-service-content">

                <span className="km-about-service-label">
                  {t(`about.services.${key}.badge`)}
                </span>

                <h3>
                  {t(`about.services.${key}.title`)}
                </h3>

                <p>
                  {t(`about.services.${key}.description`)}
                </p>

                <div className="km-about-service-meta">
                  {t(`about.services.${key}.meta`)}
                </div>

              </div>

            </article>

          ))}

        </div>

      </section>

      {/* ================= FARMER CENTRIC ================= */}

      <section className="km-about-farmer-section">

        <div className="km-about-heading km-about-farmer-heading">

          <span className="km-about-label">
            {t(
              "about.farmerTag",
              "Designed for Farmers"
            )}
          </span>

          <h2>
            {t(
              "about.farmerTitle",
              "Technology should feel simple."
            )}
          </h2>

          <p>
            {t(
              "about.farmerLead",
              "The platform is designed around accessibility, clarity and everyday agricultural needs."
            )}
          </p>

        </div>

        <div className="km-about-farmer-grid">

          {/* MULTILINGUAL */}

          <article className="km-about-farmer-feature">

            <div className="km-about-feature-icon">
              <Languages size={22} />
            </div>

            <h3>
              {t(
                "about.farmer.cards.multilingual.title",
                "Multilingual Access"
              )}
            </h3>

            <p>
              {t(
                "about.farmer.cards.multilingual.text",
                "Agricultural information can be explored in multiple Indian regional languages."
              )}
            </p>

            <div className="km-about-language-list">

              {REGIONAL_LANGUAGES.map((language) => (
                <span key={language.code}>
                  {language.name}
                </span>
              ))}

            </div>

          </article>

          {/* EASY ACCESS */}

          <article className="km-about-farmer-feature">

            <div className="km-about-feature-icon">
              <Smartphone size={22} />
            </div>

            <h3>
              {t(
                "about.farmer.cards.access.title",
                "Easy to Access"
              )}
            </h3>

            <p>
              {t(
                "about.farmer.cards.access.text",
                "A responsive interface designed to work across phones, tablets and desktop screens."
              )}
            </p>

            <div className="km-about-feature-line">

              <CheckCircleIcon />

              {t(
                "about.farmer.cards.access.item1",
                "Responsive design"
              )}

            </div>

            <div className="km-about-feature-line">

              <CheckCircleIcon />

              {t(
                "about.farmer.cards.access.item2",
                "Simple navigation"
              )}

            </div>

          </article>

          {/* CLEAR GUIDANCE */}

          <article className="km-about-farmer-feature">

            <div className="km-about-feature-icon">
              <Layers size={22} />
            </div>

            <h3>
              {t(
                "about.farmer.cards.simple.title",
                "Clear Guidance"
              )}
            </h3>

            <p>
              {t(
                "about.farmer.cards.simple.text",
                "Technical information is organized into clear sections so users can understand the results more easily."
              )}
            </p>

            <div className="km-about-feature-line">

              <CheckCircleIcon />

              {t(
                "about.farmer.cards.simple.item1",
                "Clear visual information"
              )}

            </div>

            <div className="km-about-feature-line">

              <CheckCircleIcon />

              {t(
                "about.farmer.cards.simple.item2",
                "Practical explanations"
              )}

            </div>

          </article>

        </div>

      </section>

      {/* ================= TECHNOLOGY ================= */}

      <section className="km-about-section">

        <div className="km-about-heading">

          <span className="km-about-label">
            {t("about.techTag", "Technology")}
          </span>

          <h2>
            {t(
              "about.techTitle",
              "Technology behind KrishiMitra AI"
            )}
          </h2>

          <p>
            {t(
              "about.techLead",
              "The platform combines machine learning, APIs and modern web technologies to deliver its agricultural features."
            )}
          </p>

        </div>

        <div className="km-about-tech-grid">

          {/* MACHINE LEARNING */}

          <article className="km-about-tech-card">

            <div className="km-about-tech-icon">
              <Cpu size={20} />
            </div>

            <h3>
              {t(
                "about.tech.cards.ml.title",
                "Machine Learning"
              )}
            </h3>

            <p>
              {t(
                "about.tech.cards.ml.text",
                "Machine learning models are used for agriculture-related prediction and recommendation tasks."
              )}
            </p>

          </article>

          {/* AGRICULTURAL DATA */}

          <article className="km-about-tech-card">

            <div className="km-about-tech-icon">
              <Database size={20} />
            </div>

            <h3>
              {t(
                "about.tech.cards.data.title",
                "Agricultural Data"
              )}
            </h3>

            <p>
              {t(
                "about.tech.cards.data.text",
                "Agricultural datasets and relevant data sources support the platform's information and models."
              )}
            </p>

          </article>

          {/* BACKEND */}

          <article className="km-about-tech-card">

            <div className="km-about-tech-icon">
              <FlaskConical size={20} />
            </div>

            <h3>
              {t(
                "about.tech.cards.backend.title",
                "FastAPI Backend"
              )}
            </h3>

            <p>
              {t(
                "about.tech.cards.backend.text",
                "The Python backend connects the frontend with models, APIs and application services."
              )}
            </p>

          </article>

          {/* FRONTEND */}

          <article className="km-about-tech-card">

            <div className="km-about-tech-icon">
              <Users size={20} />
            </div>

            <h3>
              {t(
                "about.tech.cards.frontend.title",
                "Modern Web Interface"
              )}
            </h3>

            <p>
              {t(
                "about.tech.cards.frontend.text",
                "A responsive React interface provides a simple experience across different devices."
              )}
            </p>

          </article>

        </div>

      </section>

      {/* ================= CTA ================= */}

      <section className="km-about-cta">

        <div>

          <span className="km-about-cta-label">
            {t(
              "about.ctaTag",
              "Start Exploring"
            )}
          </span>

          <h2>
            {t(
              "about.ctaTitle",
              "Explore smarter agriculture with KrishiMitra AI."
            )}
          </h2>

          <p>
            {t(
              "about.ctaText",
              "Discover agricultural tools, information and AI-powered assistance in one place."
            )}
          </p>

        </div>

        <Link
          to="/"
          className="km-about-cta-button"
        >
          {t(
            "about.ctaButton",
            "Go to Home"
          )}

          <ArrowRight size={18} />
        </Link>

      </section>

    </main>
  );
}

function CheckCircleIcon() {
  return (
    <span className="km-about-small-check">
      ✓
    </span>
  );
}

export default About;