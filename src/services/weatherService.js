import axios from "axios";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = import.meta.env.VITE_WEATHER_BASE_URL;

const weatherApi = axios.create({
baseURL: BASE_URL,
timeout: 15000,
});

// Get current weather using city name
export const getCurrentWeatherByCity = async (city) => {
const response = await weatherApi.get("/weather", {
params: {
q: city,
appid: API_KEY,
units: "metric",
},
});

return response.data;
};

// Get 5-day forecast using city name
export const getForecastByCity = async (city) => {
const response = await weatherApi.get("/forecast", {
params: {
q: city,
appid: API_KEY,
units: "metric",
},
});

return response.data;
};

// Get current weather using latitude and longitude
export const getCurrentWeatherByCoords = async (lat, lon) => {
const response = await weatherApi.get("/weather", {
params: {
lat,
lon,
appid: API_KEY,
units: "metric",
},
});

return response.data;
};

// Get forecast using latitude and longitude
export const getForecastByCoords = async (lat, lon) => {
const response = await weatherApi.get("/forecast", {
params: {
lat,
lon,
appid: API_KEY,
units: "metric",
},
});

return response.data;
};
