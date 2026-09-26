import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

/**
 * Fetch wholesale mandi prices across Indian markets from the backend API.
 *
 * @param {Object} params - Query filters: { state, district, market, commodity, variety, arrival_date, limit, offset }
 * @returns {Promise<Object>} API response: { status, total, count, limit, offset, updated_date, records }
 */
export const fetchMarketPrices = async (params = {}) => {
  try {
    const queryParams = {};

    if (params.state && params.state.trim()) {
      queryParams.state = params.state.trim();
    }
    if (params.district && params.district.trim()) {
      queryParams.district = params.district.trim();
    }
    if (params.market && params.market.trim()) {
      queryParams.market = params.market.trim();
    }
    if (params.commodity && params.commodity.trim()) {
      queryParams.commodity = params.commodity.trim();
    }
    if (params.variety && params.variety.trim()) {
      queryParams.variety = params.variety.trim();
    }
    if (params.arrival_date && params.arrival_date.trim()) {
      queryParams.arrival_date = params.arrival_date.trim();
    }
    if (params.limit !== undefined) {
      queryParams.limit = Number(params.limit);
    }
    if (params.offset !== undefined) {
      queryParams.offset = Number(params.offset);
    }

    const response = await apiClient.get('/market-prices', { params: queryParams });
    return response.data;
  } catch (error) {
    if (error.response) {
      const detail = error.response.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d.msg || d.message || JSON.stringify(d)).join(', ')
          : `Server error (${error.response.status}) while retrieving mandi prices.`;
      throw new Error(message, { cause: error });
    } else if (error.request) {
      throw new Error(
        'Unable to connect to the KrishiMitra AI backend at http://127.0.0.1:8000. Please verify that the FastAPI backend is running.',
        { cause: error }
      );
    } else {
      throw new Error(error.message || 'An unexpected error occurred.', { cause: error });
    }
  }
};

export default {
  fetchMarketPrices,
};