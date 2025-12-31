const getApiBaseUrl = () => {
  // Use environment variable for production API URL
  if (import.meta.env.PROD) {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://us-central1-magizh-industries-d36e0.cloudfunctions.net';
    console.log('🔥 Production API URL:', apiUrl);
    return apiUrl;
  }
  const devUrl = 'http://localhost:5000';
  console.log('🔧 Development API URL:', devUrl);
  return devUrl;
};

export const API_BASE_URL = getApiBaseUrl();

console.log('📡 Final API_BASE_URL:', API_BASE_URL);
