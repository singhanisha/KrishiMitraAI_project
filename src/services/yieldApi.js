import axios from 'axios';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Predict crop yield per hectare from the FastAPI ML service.
 * @param {Object} params - { year, state, crop, season, area, annual_rainfall, fertilizer, pesticide }
 * @returns {Promise<Object>} API response data
 */
export const predictCropYield = async (params) => {
  try {
    const payload = {
      year: Number(params.year),
      state: String(params.state).trim(),
      crop: String(params.crop).trim(),
      season: String(params.season).trim(),
      area: Number(params.area),
      annual_rainfall: Number(params.annual_rainfall),
      fertilizer: Number(params.fertilizer),
      pesticide: Number(params.pesticide),
    };

    const response = await apiClient.post('/yield-prediction/predict', payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      const detail = error.response.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d.msg || d.message || JSON.stringify(d)).join(', ')
          : 'Server returned an error processing your yield prediction request.';
      throw new Error(message, { cause: error });
    } else if (error.request) {
      throw new Error(
        'Unable to connect to KrishiMitraAI API server at http://127.0.0.1:8001. Please verify that the FastAPI backend is running.',
        { cause: error }
      );
    } else {
      throw new Error(error.message || 'An unexpected error occurred.', { cause: error });
    }
  }
};

export default {
  predictCropYield,
};
