const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return 'https://magizh-industries--magizh-industries-d36e0.europe-west4.hosted.app';
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
