import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Headphones,
  MessageSquare,
  HelpCircle,
  Send,
  User,
  Mail,
  FileText,
  CheckCircle2,
  Sprout,
  Check,
} from "lucide-react";

import "./Contact.css";

function Contact() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setFormError(
        t(
          "contact.form.error",
          "Please provide your name, email, and message."
        )
      );
      return;
    }

    // UI demonstration only
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    setSubmitted(false);
    setFormError("");
  };

  return (
    <main className="contact-page-wrapper">

      {/* ================= HEADER & BREADCRUMB ================= */}

      <header className="contact-header-container">
        <nav className="contact-breadcrumb" aria-label="Breadcrumb">

          {/* <Link to="/" className="breadcrumb-link">
            <ArrowLeft size={16} />
            <span>
              {t("navbar.home", "Home")}
            </span>
          </Link>

          <ChevronRight
            size={14}
            className="breadcrumb-separator"
          />

          <span className="breadcrumb-current">
            {t("navbar.contact", "Contact Us")}
          </span> */}

        </nav>

        <div className="contact-title-section">

          <div className="contact-badge-pill">
            <Sparkles size={15} />
            <span>
              {t("contact.badge", "Get in Touch")}
            </span>
          </div>

          <h1>
            {t("contact.title", "Contact Us")}
          </h1>

          <p className="contact-lead-text">
            {t(
              "contact.lead",
              "Have questions about KrishiMitraAI, need guidance on using our decision-support modules, or want to share feedback? Get in touch with our team."
            )}
          </p>

        </div>
      </header>

      {/* ================= TWO-COLUMN MAIN LAYOUT ================= */}

      <div className="contact-main-grid">

        {/* ================= LEFT SIDE ================= */}

        <section className="contact-info-column">

          <div className="contact-column-header">

            <span className="section-tag">
              {t(
                "contact.channelsTag",
                "Direct Channels"
              )}
            </span>

            <h2>
              {t(
                "contact.channelsTitle",
                "Get in Touch"
              )}
            </h2>

            <p>
              {t(
                "contact.channelsLead",
                "We welcome enquiries, constructive feedback, and academic collaboration regarding the KrishiMitraAI platform."
              )}
            </p>

          </div>

          <div className="contact-info-cards-stack">

            {/* PROJECT SUPPORT */}

            <div className="contact-info-card">

              <div className="contact-card-top">

                <div className="contact-icon-box">
                  <Headphones size={22} />
                </div>

                <div className="contact-card-title-group">

                  <h3>
                    {t(
                      "contact.channels.support.title",
                      "Project Support"
                    )}
                  </h3>

                  <span>
                    {t(
                      "contact.channels.support.subtitle",
                      "Feature & Usage Assistance"
                    )}
                  </span>

                </div>

              </div>

              <p>
                {t(
                  "contact.channels.support.text",
                  "Assistance with entering soil parameters, interpreting NPK ratio balances, and querying live APMC mandi wholesale price trends across states."
                )}
              </p>

              <div className="contact-card-footer-pill">
                {t(
                  "contact.channels.support.scope",
                  "Support Scope: Academic & Platform Usage"
                )}
              </div>

            </div>

            {/* FEEDBACK */}

            <div className="contact-info-card">

              <div className="contact-card-top">

                <div className="contact-icon-box">
                  <MessageSquare size={22} />
                </div>

                <div className="contact-card-title-group">

                  <h3>
                    {t(
                      "contact.channels.feedback.title",
                      "Feedback & Suggestions"
                    )}
                  </h3>

                  <span>
                    {t(
                      "contact.channels.feedback.subtitle",
                      "Platform Improvement"
                    )}
                  </span>

                </div>

              </div>

              <p>
                {t(
                  "contact.channels.feedback.text",
                  "We actively seek grower suggestions to improve interface accessibility, expand regional language translations, and refine agronomic guidance."
                )}
              </p>

              <div className="contact-card-footer-pill">
                {t(
                  "contact.channels.feedback.scope",
                  "Focus: Usability & Farmer Interface"
                )}
              </div>

            </div>

            {/* GENERAL ENQUIRIES */}

            <div className="contact-info-card">

              <div className="contact-card-top">

                <div className="contact-icon-box">
                  <HelpCircle size={22} />
                </div>

                <div className="contact-card-title-group">

                  <h3>
                    {t(
                      "contact.channels.general.title",
                      "General Enquiries"
                    )}
                  </h3>

                  <span>
                    {t(
                      "contact.channels.general.subtitle",
                      "Academic & Research Collaboration"
                    )}
                  </span>

                </div>

              </div>

              <p>
                {t(
                  "contact.channels.general.text",
                  "Inquiries regarding platform architecture, Scikit-Learn Random Forest benchmarks, Government open data feeds, and institutional presentations."
                )}
              </p>

              <div className="contact-card-footer-pill">
                {t(
                  "contact.channels.general.scope",
                  "Scope: Open Agricultural Research"
                )}
              </div>

            </div>

          </div>
        </section>

        {/* ================= RIGHT SIDE: FORM ================= */}

        <section className="contact-form-card">

          <div className="contact-column-header">

            <span className="section-tag">
              {t(
                "contact.form.tag",
                "Message Form"
              )}
            </span>

            <h2>
              {t(
                "contact.form.title",
                "Send Us a Message"
              )}
            </h2>

            <p>
              {t(
                "contact.form.description",
                "Fill out the details below to share your inquiry, question, or suggestions with the KrishiMitraAI project."
              )}
            </p>

          </div>

          {submitted ? (

            /* ================= SUCCESS MESSAGE ================= */

            <div className="form-success-banner">

              <CheckCircle2
                size={24}
                className="form-success-icon"
              />

              <div className="form-success-text">

                <strong>
                  {t(
                    "contact.form.successTitle",
                    "Thank you for your message!"
                  )}
                </strong>

                <p>
                  {t(
                    "contact.form.successText",
                    "Your feedback and inquiry details have been noted for the KrishiMitraAI project. Thank you for supporting smart agriculture."
                  )}
                </p>

                <button
                  type="button"
                  onClick={handleReset}
                  className="reset-form-link"
                >
                  {t(
                    "contact.form.sendAnother",
                    "Send another message"
                  )}
                </button>

              </div>

            </div>

          ) : (

            /* ================= CONTACT FORM ================= */

            <form
              onSubmit={handleSubmit}
              className="contact-form"
              noValidate
            >

              {formError && (
                <div
                  style={{
                    color: "#b3261e",
                    fontSize: "13px",
                    background: "#fdf2f2",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #f9d2ce",
                  }}
                >
                  {formError}
                </div>
              )}

              {/* NAME */}

              <div className="form-group">

                <label htmlFor="contact-name">
                  <User size={15} />

                  <span>
                    {t(
                      "contact.form.nameLabel",
                      "Full Name"
                    )}
                  </span>
                </label>

                <div className="form-input-wrapper">

                  {/* <User
                    size={16}
                    className="form-input-icon"
                  /> */}

                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder={t(
                      "contact.form.namePlaceholder",
                      "Enter your full name"
                    )}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div className="form-group">

                <label htmlFor="contact-email">

                  <Mail size={15} />

                  <span>
                    {t(
                      "contact.form.emailLabel",
                      "Email Address"
                    )}
                  </span>

                </label>

                <div className="form-input-wrapper">

                  {/* <Mail
                    size={16}
                    className="form-input-icon"
                  /> */}

                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder={t(
                      "contact.form.emailPlaceholder",
                      "name@example.com"
                    )}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* SUBJECT */}

              <div className="form-group">

                <label htmlFor="contact-subject">

                  <FileText size={15} />

                  <span>
                    {t(
                      "contact.form.subjectLabel",
                      "Subject"
                    )}
                  </span>

                </label>

                <div className="form-input-wrapper">

                  {/* <FileText
                    size={16}
                    className="form-input-icon"
                  /> */}

                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    placeholder={t(
                      "contact.form.subjectPlaceholder",
                      "What is your enquiry about?"
                    )}
                    value={formData.subject}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* MESSAGE */}

              <div className="form-group">

                <label htmlFor="contact-message">

                  <MessageSquare size={15} />

                  <span>
                    {t(
                      "contact.form.messageLabel",
                      "Message"
                    )}
                  </span>

                </label>

                <div className="form-input-wrapper">

                 {/*  <MessageSquare
                    size={16}
                    className="form-input-icon"
                  /> */}

                  <textarea
                    id="contact-message"
                    name="message"
                    placeholder={t(
                      "contact.form.messagePlaceholder",
                      "Type your message, feedback, or inquiry here..."
                    )}
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="form-submit-btn"
              >
                <Send size={16} />

                <span>
                  {t(
                    "contact.form.submit",
                    "Send Message"
                  )}
                </span>
              </button>

            </form>
          )}

        </section>
      </div>

      {/* ================= PROJECT OVERVIEW ================= */}

      <section className="contact-project-overview-card">

        <div className="project-overview-header">

          <div className="project-overview-icon">
            <Sprout size={22} />
          </div>

          <h3>
            {t(
              "contact.project.title",
              "KrishiMitraAI Platform Project"
            )}
          </h3>

        </div>

        <p>
          {t(
            "contact.project.description",
            "KrishiMitraAI brings together critical agricultural decision-support capabilities onto a single unified, accessible web platform. Developed to assist Indian farmers at every stage of cultivation, the system integrates empirical machine learning for crop recommendation, laboratory-grounded soil nutrient analysis, real-time Government of India APMC mandi wholesale rates, and developing agro-climatic capabilities."
          )}
        </p>

        <div className="project-pills-row">

          <span className="project-pill-item">
            <Check size={13} />
            {t(
              "contact.project.pills.crop",
              "Crop Recommendation Engine"
            )}
          </span>

          <span className="project-pill-item">
            <Check size={13} />
            {t(
              "contact.project.pills.soil",
              "Soil Health Diagnostics"
            )}
          </span>

          <span className="project-pill-item">
            <Check size={13} />
            {t(
              "contact.project.pills.market",
              "Live Agmarknet Mandi Feeds"
            )}
          </span>

          <span className="project-pill-item">
            <Check size={13} />
            {t(
              "contact.project.pills.languages",
              "12 Indian Regional Languages"
            )}
          </span>

          <span className="project-pill-item">
            <Check size={13} />
            {t(
              "contact.project.pills.ui",
              "Farmer-First Responsive UI"
            )}
          </span>

        </div>

      </section>

      {/* ================= BOTTOM SECTION ================= */}

      <section className="contact-closing-banner">

        <div className="closing-banner-text">

          <h2>
            {t(
              "contact.closing.title",
              "Return to KrishiMitraAI Home"
            )}
          </h2>

          <p>
            {t(
              "contact.closing.text",
              "Explore our agricultural decision-support modules, farmer knowledge resources, and platform services."
            )}
          </p>

        </div>

        <Link
          to="/"
          className="contact-home-btn"
        >
          <span>
            {t(
              "contact.closing.button",
              "Back to Home"
            )}
          </span>
        </Link>

      </section>

    </main>
  );
}

export default Contact;