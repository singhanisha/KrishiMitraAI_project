import { useState, useCallback } from "react";

import {
getCurrentWeatherByCity,
getForecastByCity,
getCurrentWeatherByCoords,
getForecastByCoords,
} from "../services/weatherService";

export const useWeather = () => {
const [current, setCurrent] = useState(null);
const [forecast, setForecast] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const fetchByCity = useCallback(async (city) => {
if (!city || city.trim() === "") {
setError("Please enter a valid city name");
return;
}


setLoading(true);
setError("");

try {
  const currentData = await getCurrentWeatherByCity(city.trim());
  const forecastData = await getForecastByCity(city.trim());

  setCurrent(currentData);
  setForecast(forecastData);
} catch (err) {
  console.error("Weather Error:", err);

  const message =
    err?.response?.data?.message ||
    err?.message ||
    "Unable to fetch weather data";

  setError(message);
  setCurrent(null);
  setForecast(null);
} finally {
  setLoading(false);
}


}, []);

const fetchByLocation = useCallback(() => {
if (!navigator.geolocation) {
setError("Geolocation is not supported by your browser");
return;
}


setLoading(true);
setError("");

navigator.geolocation.getCurrentPosition(
  async (position) => {
    try {
      const { latitude, longitude } = position.coords;

      const currentData = await getCurrentWeatherByCoords(
        latitude,
        longitude
      );

      const forecastData = await getForecastByCoords(
        latitude,
        longitude
      );

      setCurrent(currentData);
      setForecast(forecastData);
    } catch (err) {
      console.error("Location Weather Error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to fetch weather data";

      setError(message);
    } finally {
      setLoading(false);
    }
  },
  (geoError) => {
    console.error("Location Error:", geoError);
    setError("Unable to access your location");
    setLoading(false);
  }
);


}, []);

return {
current,
forecast,
loading,
error,
fetchByCity,
fetchByLocation,
};
};
