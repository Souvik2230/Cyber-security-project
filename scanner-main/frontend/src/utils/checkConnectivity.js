import axios from 'axios';

export const checkConnectivity = async () => {
  try {
    const response = await axios.get('/api/health-check'); // Adjust the endpoint as needed
    if (response.status === 200) {
      return true;
    }
  } catch (error) {
    console.error('Connectivity check failed:', error);
    return false;
  }
};