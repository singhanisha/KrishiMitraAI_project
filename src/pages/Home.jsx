import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sprout,Leaf,CloudSun,FlaskConical,TrendingUp,Store,Droplets,Bug,ArrowRight,MessageCircle,ShieldCheck,
} from "lucide-react";

import cropIcon from "../assets/cropRecommendation_image.png";
import diseaseIcon from "../assets/diseasedetection_image.png";
import soilIcon from "../assets/soilanalysis_image.png";
import weatherIcon from "../assets/weatherforecast_image.png";
import yieldIcon from "../assets/yieldprediction_image.png";
import marketIcon from "../assets/marketprice_image.png";

import insightsoilIcon from "../assets/insightsoil_image.png";
import insightdiseaseIcon from "../assets/insightdisease_image.png";
import insightwaterIcon from "../assets/insightwater_image.png";

import footerImage from "../assets/footer_image.png"

import heroImage from "../assets/Farmer_Image.png";



function Home({ onOpenChat }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const services = [
    {
      icon: <img src={cropIcon} alt="Crop Recommendation" className="service-icon" />,
      title: t("services.cropRecommendation.title"),
      description: t("services.cropRecommendation.description"),
      button: t("services.cropRecommendation.button"),
      className: "green-card",
      path: "/crop-recommendation",
    },
    {
      icon: <img src={diseaseIcon} alt="DiseaseDetection" className="service-icon" />,
      title: t("services.diseaseDetection.title"),
      description: t("services.diseaseDetection.description"),
      button: t("services.diseaseDetection.button"),
      className: "green-card",
    },
    {
      icon: <img src={soilIcon} alt="SoilAnalysis" className="service-icon" />,
      title: t("services.soilAnalysis.title"),
      description: t("services.soilAnalysis.description"),
      button: t("services.soilAnalysis.button"),
      className: "green-card",
      path: "/soil-analysis",
    },
    {
      icon: <img src={weatherIcon} alt="Weather" className="service-icon" />,
      title: t("services.weather.title"),
      description: t("services.weather.description"),
      button: t("services.weather.button"),
      className: "yellow-card",
      path: "/weather",
    },
    {
      icon: <img src={yieldIcon} alt="YieldPrediction" className="service-icon" />,
      title: t("services.yieldPrediction.title"),
      description: t("services.yieldPrediction.description"),
      button: t("services.yieldPrediction.button"),
      className: "green-card",
      path: "/yield-prediction",
    },
    {
      icon: <img src={marketIcon} alt="MarketPrices" className="service-icon" />,
      title: t("services.marketPrices.title"),
      description: t("services.marketPrices.description"),
      button: t("services.marketPrices.button"),
      className: "yellow-card",
      path: "/market-prices",
    },
  ];

  const insights = [
    {
      icon: <img src={insightsoilIcon} alt="insightsoil" className="insight-icon" />,
      title: t("insights.soil.title"),
      description: t("insights.soil.description"),
      path: "/insights/soil",
    },
    {
      icon: <img src={insightdiseaseIcon} alt="insightdisease" className="insight-icon" />,
      title: t("insights.disease.title"),
      description: t("insights.disease.description"),
      path: "/insights/disease",
    },
    {
      icon: <img src={insightwaterIcon} alt="insightwater" className="insight-icon" />,
      title: t("insights.water.title"),
      description: t("insights.water.description"),
      path: "/insights/water",
    },
  ];

  return (
    <main className="home-page">

      {/* ================= HERO ================= */}

      <section
        className="hero-section"
        style={{
          backgroundImage: `linear-gradient(
            rgba(15, 55, 25, 0.42),
            rgba(15, 55, 25, 0.28)
          ), url(${heroImage})`,
        }}
      >
        <div className="hero-content">

          <div className="hero-badge">
            <ShieldCheck size={16} />
            {t("hero.aiPowered")}
          </div>

          <h1>
            {t("hero.title")}
          </h1>

          <p>
            {t("hero.description")}
          </p>

          <div className="hero-buttons">

            <button
              className="primary-button"
              onClick={() => navigate("/services")}
            >
              {t("hero.exploreServices")}
              <ArrowRight size={18} />
            </button>

            <button className="secondary-button" onClick={onOpenChat}>
              <MessageCircle size={18} />
              {t("hero.askAssistant")}
            </button>

          </div>

          <div className="hero-features">
            <span>
              <Sprout size={17} />
              {t("hero.farmerFirst")}
            </span>

            <span>
              <Leaf size={17} />
              {t("hero.multilingual")}
            </span>
          </div>

        </div>
      </section>


      {/* ================= SERVICES ================= */}

      <section className="services-section-home">

        <div className="section-heading-home">

          <span className="section-label-home">
            KRISHIMITRA AI
          </span>

          <h2>
            {t("services.title")}
          </h2>

          <p>
            {t("services.subtitle")}
          </p>

        </div>


        <div className="services-grid">

          {services.map((service, index) => (
            <div
              className={`service-card ${service.className}`}
              key={index}
            >

              <div className="service-icon">
                {service.icon}
              </div>

              <div className="service-content">

                <h3>
                  {service.title}
                </h3>

                <p>
                  {service.description}
                </p>

                {/* <button className="card-button">
                  {service.button}
                  <ArrowRight size={15} />
                </button> */}
                <button className="card-button" onClick={() => service.path && navigate(service.path)}>
                  {service.button}
                </button>

              </div>

            </div>
          ))}

        </div>

      </section>


      {/* ================= INSIGHTS ================= */}

      <section className="insights-section-home">

        <div className="section-heading-home">

          <span className="section-label-home">
            FARMER KNOWLEDGE
          </span>

          <h2>
            {t("insights.title")}
          </h2>

          <p>
            {t("insights.subtitle")}
          </p>

        </div>


        <div className="insights-grid">

          {insights.map((item, index) => (
            <div className="insight-card" key={index}>

              <div className="insight-icon">
                {item.icon}
              </div>

              <div>
                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.description}
                </p>

                <button onClick={() => item.path && navigate(item.path)}>
                  {t("insights.soil.button")}
                  <ArrowRight size={15} />
                </button>
              </div>

            </div>
          ))}

        </div>

      </section>


      {/* ================= AI ASSISTANT ================= */}

      <section className="assistant-section">

        <div className="assistant-card">

             <img
                src={footerImage}
                alt="KrishiMitra AI Assistant"
                className="assistant-bg"
            />

          <div className="assistant-icon">
            <MessageCircle size={38} />
          </div>

          <h2>
            {t("assistant.title")}
          </h2>

          <p>
            {t("assistant.description")}
          </p>

          <button className="assistant-button" onClick={onOpenChat}>
            <MessageCircle size={20} />
            {t("services.aiAssistant.button")}
          </button>

          {/* <div className="language-hints">

            <span>
              {t("assistant.chatEnglish")}
            </span>

            <span>
              {t("assistant.chatHindi")}
            </span>

            <span>
              {t("assistant.chatMarathi")}
            </span>

          </div>
 */}
        </div>

      </section>


      {/* ================= STATS ================= */}

      <section className="stats-section">

        <div className="stat-box">
          <strong>5+</strong>
          <span>{t("stats.services")}</span>
        </div>

        <div className="stat-box">
          <strong>9+</strong>
          <span>{t("stats.languages")}</span>
        </div>

        <div className="stat-box">
          <strong>ML + AI</strong>
          <span>{t("stats.models")}</span>
        </div>

        <div className="stat-box">
          <strong>1</strong>
          <span>{t("stats.platform")}</span>
        </div>

      </section>

    </main>
  );
}

export default Home;