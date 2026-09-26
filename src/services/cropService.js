import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const predictCrop = async (formValues) => {
  try {
    const payload = {
      nitrogen: Number(formValues.nitrogen),
      phosphorus: Number(formValues.phosphorus),
      potassium: Number(formValues.potassium),
      temperature: Number(formValues.temperature),
      humidity: Number(formValues.humidity),
      ph: Number(formValues.ph),
      rainfall: Number(formValues.rainfall),
      language: formValues.language || "en",
    };

    const response = await axios.post(
      `${API_URL}/crop-recommendation/predict`,
      payload
    );

    return response.data;
  } catch (error) {
    console.error("Crop Recommendation Error:", error);

    if (error.response) {
      const detail = error.response.data?.detail;
      throw new Error(
        typeof detail === "string"
          ? detail
          : "Server could not process the crop recommendation request."
      );
    }

    throw new Error(
      "Could not connect to the KrishiMitra AI backend. Please make sure the backend server is running."
    );
  }
};