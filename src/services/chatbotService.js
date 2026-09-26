/* import { getCurrentWeatherByCity } from "./weatherService";

// Check if question is related to weather
const isWeatherQuestion = (message) => {
  const weatherKeywords = [
    "weather",
    "temperature",
    "temp",
    "rain",
    "rainfall",
    "forecast",
    "climate",
    "humidity",
    "wind",
    "mausam",
    "बारिश",
    "तापमान",
    "मौसम",
    "हवा",
    "humidity",
  ];

  const lowerMessage = message.toLowerCase();

  return weatherKeywords.some((keyword) =>
    lowerMessage.includes(keyword.toLowerCase())
  );
};

// Extract city name from user question
const extractCity = (message) => {
  const lowerMessage = message.toLowerCase();

  // Common cities for testing
  const cities = [
    "pune",
    "mumbai",
    "delhi",
    "kochi",
    "varanasi",
    "nagpur",
    "nashik",
    "kolkata",
    "chennai",
    "bangalore",
    "bengaluru",
    "hyderabad",
    "lucknow",
    "jaipur",
    "bhopal",
    "indore",
    "ahmedabad",
    "surat",
    "patna",
    "kanpur",
  ];

  for (const city of cities) {
    if (lowerMessage.includes(city)) {
      return city;
    }
  }

  return null;
};

export const getChatbotResponse = async (message) => {
  // Check weather question
  if (isWeatherQuestion(message)) {
    const city = extractCity(message);

    if (!city) {
      return "Please tell me the city name for the weather information. For example: What is the weather in Pune?";
    }

    try {
      const weatherData = await getCurrentWeatherByCity(city);

      const temperature = Math.round(weatherData.main.temp);
      const humidity = weatherData.main.humidity;
      const condition = weatherData.weather[0].description;
      const windSpeed = weatherData.wind.speed;

      return `The current weather in ${weatherData.name} is ${condition}. The temperature is ${temperature}°C, humidity is ${humidity}%, and wind speed is ${windSpeed} m/s.`;
    } catch (error) {
      console.error("Chatbot Weather Error:", error);

      return `Sorry, I couldn't fetch the weather information for ${city}. Please try again.`;
    }
  }

  // Default response for now
  return "I am currently learning how to answer agriculture and general questions. I can help you with weather information right now! Try asking: What is the temperature in Mumbai?";
}; */





import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const getChatbotResponse = async (message) => {
  try {
    const response = await axios.post(`${API_URL}/chat`, {
      message: message,
    });

    return response.data.response;
  } catch (error) {
    console.error("Chatbot Backend Error:", error);

    if (error.response) {
      return (
        error.response.data?.detail ||
        "Sorry, the AI assistant is unable to respond right now."
      );
    }

    return "Sorry, I couldn't connect to the KrishiMitra AI backend. Please make sure the backend server is running.";
  }
};