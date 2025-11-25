import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const coverAPI = {
  uploadCoverAudio: async (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);

    return api.post('/cover/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },

  generateCover: async (uploadUrl, prompt, style) => {
    try {
      // Log the request data
      console.log('Sending cover generation request:', {
        uploadUrl,
        prompt,
        style
      });
      
      const response = await api.post('/cover/generate', {
        uploadUrl: uploadUrl,
        prompt,
        style,
        title: 'Cover Song',
        customMode: true,
        instrumental: true,
        model: 'V5',
        vocalGender: 'm',
        styleWeight: 0.65,
        weirdnessConstraint: 0.65,
        audioWeight: 0.65
      });
      
      return response;
    } catch (error) {
      console.error('Error in generateCover:', {
        error,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
};

export { coverAPI };