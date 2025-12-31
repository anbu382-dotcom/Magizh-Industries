const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return '';
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
