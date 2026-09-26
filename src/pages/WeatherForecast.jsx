import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  Search,
  MapPin,
  Droplets,
  Wind,
  Cloud,
  Thermometer,
  Navigation,
  Sunrise,
} from "lucide-react";

import { useWeather } from "../hooks/useWeather";
import "./css/WeatherForecast.css";

const WeatherForecast = () => {
  const { t } = useTranslation();

  const [city, setCity] = useState("Pune");

  const {
    current,
    forecast,
    loading,
    error,
    fetchByCity,
    fetchByLocation,
  } = useWeather();

  // Load Pune weather when page opens
  useEffect(() => {
    fetchByCity("Pune");
  }, [fetchByCity]);

  const handleSearch = (event) => {
    event.preventDefault();

    if (city.trim()) {
      fetchByCity(city.trim());
    }
  };

  // Select approximately one forecast per day
  const dailyForecast =
    forecast?.list?.filter((_, index) => index % 8 === 0) || [];

  const getWeekday = (timestamp) => {
    const day = new Date(timestamp * 1000).getDay();

    const weekdays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    return t(`services.weather.weekdays.${weekdays[day]}`);
  };

  return (
    <div className="weather-page">
      <div className="weather-container">

        {/* Header */}
        <div className="weather-header">
          <span className="weather-badge">
            <Cloud size={16} />
            {t("services.weather.liveWeather")}
          </span>

          <h1>{t("services.weather.title")}</h1>

          <p>{t("services.weather.description")}</p>
        </div>

        {/* Search Section */}
        <form onSubmit={handleSearch} className="weather-search">
          <div className="search-input-wrapper">
            <Search size={20} />

            <input
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder={t("services.weather.searchPlaceholder")}
            />
          </div>

          <button type="submit" className="search-btn">
            <Search size={18} />
            {t("services.weather.search")}
          </button>

          <button
            type="button"
            className="location-btn"
            onClick={fetchByLocation}
          >
            <Navigation size={18} />
            {t("services.weather.useLocation")}
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="weather-status loading">
            {t("services.weather.loading")}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="weather-status error">
            {error}
          </div>
        )}

        {/* Current Weather */}
        {current && !loading && (
          <section className="current-weather-card">

            <div className="weather-main">

              <div className="weather-location">
                <MapPin size={20} />

                <span>
                  {current.name}
                  {current.sys?.country
                    ? `, ${current.sys.country}`
                    : ""}
                </span>
              </div>

              <div className="temperature-section">
                <div>
                  <span className="temperature">
                    {Math.round(current.main.temp)}°
                  </span>

                  <span className="celsius">C</span>
                </div>

                <p className="weather-description">
                  {current.weather?.[0]?.description}
                </p>
              </div>

            </div>

            {/* Weather Icon */}
            {current.weather?.[0]?.icon && (
              <div className="weather-icon-large">
                <img
                  src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`}
                  alt={
                    current.weather?.[0]?.description ||
                    t("services.weather.weatherAlt")
                  }
                />
              </div>
            )}

            {/* Weather Details */}
            <div className="weather-details-grid">

              <div className="weather-detail">
                <Droplets size={24} />

                <div>
                  <span>
                    {t("services.weather.humidity")}
                  </span>

                  <strong>
                    {current.main.humidity}%
                  </strong>
                </div>
              </div>

              <div className="weather-detail">
                <Wind size={24} />

                <div>
                  <span>
                    {t("services.weather.windSpeed")}
                  </span>

                  <strong>
                    {current.wind.speed} m/s
                  </strong>
                </div>
              </div>

              <div className="weather-detail">
                <Cloud size={24} />

                <div>
                  <span>
                    {t("services.weather.cloudCoverage")}
                  </span>

                  <strong>
                    {current.clouds.all}%
                  </strong>
                </div>
              </div>

              <div className="weather-detail">
                <Thermometer size={24} />

                <div>
                  <span>
                    {t("services.weather.feelsLike")}
                  </span>

                  <strong>
                    {Math.round(current.main.feels_like)}°C
                  </strong>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* Forecast */}
        {dailyForecast.length > 0 && !loading && (
          <section className="forecast-section">

            <div className="forecast-heading">

              <span className="weather-badge">
                <Sunrise size={16} />

                {t("services.weather.fiveDayForecast")}
              </span>

              <h2>
                {t("services.weather.upcomingWeather")}
              </h2>

              <p>
                {t("services.weather.farmingInsight")}
              </p>

            </div>

            <div className="forecast-grid">

              {dailyForecast.slice(0, 5).map((day) => (
                <div
                  key={day.dt}
                  className="forecast-card"
                >

                  <p className="forecast-day">
                    {getWeekday(day.dt)}
                  </p>

                  {day.weather?.[0]?.icon && (
                    <img
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                      alt={
                        day.weather?.[0]?.description ||
                        t("services.weather.weatherAlt")
                      }
                    />
                  )}

                  <p className="forecast-temp">
                    {Math.round(day.main.temp)}°C
                  </p>

                  <p className="forecast-description">
                    {day.weather?.[0]?.description}
                  </p>

                </div>
              ))}

            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default WeatherForecast;