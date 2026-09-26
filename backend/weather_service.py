import requests
import os

from dotenv import load_dotenv
from datetime import datetime, timedelta


load_dotenv()


API_KEY = os.getenv("OPENWEATHER_API_KEY")

BASE_URL = "https://api.openweathermap.org/data/2.5"


# ==========================================
# CURRENT WEATHER
# ==========================================

def get_current_weather(city):

    try:

        if not API_KEY:
            raise Exception(
                "OPENWEATHER_API_KEY is missing in .env file"
            )

        url = f"{BASE_URL}/weather"

        params = {
            "q": city,
            "appid": API_KEY,
            "units": "metric"
        }

        response = requests.get(
            url,
            params=params,
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        return {
            "success": True,
            "city": data["name"],
            "temperature": round(data["main"]["temp"]),
            "feels_like": round(data["main"]["feels_like"]),
            "humidity": data["main"]["humidity"],
            "description": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"]
        }

    except Exception as e:

        print("Weather API Error:", e)

        return {
            "success": False,
            "error": str(e)
        }


# ==========================================
# WEATHER FORECAST
# ==========================================

def get_forecast(city):

    try:

        if not API_KEY:
            raise Exception(
                "OPENWEATHER_API_KEY is missing in .env file"
            )

        url = f"{BASE_URL}/forecast"

        params = {
            "q": city,
            "appid": API_KEY,
            "units": "metric"
        }

        response = requests.get(
            url,
            params=params,
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        return {
            "success": True,
            "city": data["city"]["name"],
            "timezone": data["city"]["timezone"],
            "forecast": data["list"]
        }

    except Exception as e:

        print("Forecast API Error:", e)

        return {
            "success": False,
            "error": str(e)
        }


# ==========================================
# TOMORROW RAIN PREDICTION
# ==========================================

def get_tomorrow_rain_prediction(city):

    try:

        forecast_data = get_forecast(city)

        if not forecast_data["success"]:

            return {
                "success": False,
                "error": forecast_data["error"]
            }

        forecast_list = forecast_data["forecast"]

        # Tomorrow date
        tomorrow = datetime.now().date() + timedelta(days=1)

        tomorrow_forecasts = []

        for item in forecast_list:

            forecast_datetime = datetime.fromtimestamp(
                item["dt"]
            )

            if forecast_datetime.date() == tomorrow:

                tomorrow_forecasts.append(item)

        if not tomorrow_forecasts:

            return {
                "success": False,
                "error": "Tomorrow forecast not available"
            }

        max_probability = 0
        rain_expected = False

        for item in tomorrow_forecasts:

            weather_main = item["weather"][0]["main"].lower()

            probability = item.get("pop", 0)

            max_probability = max(
                max_probability,
                probability
            )

            if weather_main in [
                "rain",
                "drizzle",
                "thunderstorm"
            ]:
                rain_expected = True


        return {

            "success": True,

            "city": forecast_data["city"],

            "rain_expected": rain_expected,

            "probability": round(
                max_probability * 100
            )
        }

    except Exception as e:

        print("Tomorrow Rain Error:", e)

        return {
            "success": False,
            "error": str(e)
        }