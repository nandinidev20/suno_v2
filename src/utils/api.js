import axios from 'axios';

// Request cache and throttling
const requestCache = new Map();
const requestQueue = new Map();
const REQUEST_DELAY = 1000; // 1 second delay between requests

// Base API configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request throttling function
const throttleRequest = (url, requestFn) => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const lastRequest = requestQueue.get(url) || 0;
    const timeSinceLastRequest = now - lastRequest;
    
    if (timeSinceLastRequest < REQUEST_DELAY) {
      // Wait before making the request
      setTimeout(() => {
        requestQueue.set(url, Date.now());
        requestFn().then(resolve).catch(reject);
      }, REQUEST_DELAY - timeSinceLastRequest);
    } else {
      // Make request immediately
      requestQueue.set(url, Date.now());
      requestFn().then(resolve).catch(reject);
    }
  });
};

// Request interceptor to add auth token and caching
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add cache key for GET requests
    if (config.method === 'get') {
      const cacheKey = `${config.url}?${JSON.stringify(config.params || {})}`;
      config.cacheKey = cacheKey;
      
      // Check cache first
      const cached = requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
        return Promise.reject({ 
          isCached: true, 
          data: cached.data,
          config 
        });
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and caching
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.config.cacheKey) {
      requestCache.set(response.config.cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    return response;
  },
  (error) => {
    // Handle cached responses
    if (error.isCached) {
      return Promise.resolve({ data: error.data });
    }
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      console.warn('Rate limited, retrying after delay...');
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          api.request(error.config).then(resolve).catch(reject);
        }, 2000); // Wait 2 seconds before retry
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      //window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// Music Generation API
export const generateAPI = {
  generateMusic: (data) => api.post('/generate', data),
  getStatus: (trackId) => api.get(`/generate/status/${trackId}`),
};

// MusicGPT API bridge
export const musicAPI = {
  generate: (data) => api.post('/music/generate', data),
};

// Tracks API
export const tracksAPI = {
  getMyTracks: (page = 1, limit = 10) => 
    throttleRequest(`/tracks/my-tracks?page=${page}&limit=${limit}`, () => 
      api.get(`/tracks/my-tracks?page=${page}&limit=${limit}`)
    ),
  getPublicTracks: (page = 1, limit = 20) => 
    throttleRequest(`/tracks/public?page=${page}&limit=${limit}`, () => 
      api.get(`/tracks/public?page=${page}&limit=${limit}`)
    ),
  getTrack: (trackId) => api.get(`/tracks/${trackId}`),
  updateTrack: (trackId, data) => api.patch(`/tracks/${trackId}`, data),
  deleteTrack: (trackId) => api.delete(`/tracks/${trackId}`),
  likeTrack: (trackId) => api.post(`/tracks/${trackId}/like`),
  saveTrack: (trackData) => api.post('/tracks', trackData),
};

// Stripe API
export const stripeAPI = {
  getPlans: () => 
    throttleRequest('/stripe/plans', () => api.get('/stripe/plans')),
  createCheckoutSession: (planType) => api.post('/stripe/create-checkout-session', { planType }),
  createPortalSession: () => api.post('/stripe/create-portal-session'),
  getSubscriptionStatus: () => 
    throttleRequest('/me/subscription', () => api.get('/me/subscription')),
  getTransactions: () => 
    throttleRequest('/stripe/transactions', () => api.get('/stripe/transactions')),
  handlePaymentSuccess: (sessionId) => api.post('/stripe/payment-success', { sessionId }),
  upgradePlan: (planType) => api.post('/upgrade-plan', { planType }),
  upgradePlanGuest: (planType) => api.post('/upgrade-plan-guest', { planType }),
  cancelPlan: () => api.post('/cancel-plan'),
};

// Audio Transcribe API
export const audioTranscribeAPI = {
  uploadAudio: (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    return api.post('/audio-transcribe/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Remix API
export const remixAPI = {
  startRemix: (audioFileOrUrl, lyrics, prompt, gender, style, isUrl = false) => {
    const formData = new FormData();

    if (isUrl) {
      // Send as audio_url for library tracks
      formData.append('audio_url', audioFileOrUrl);
    } else {
      // Send as audio file for transcribed audio
      formData.append('audio', audioFileOrUrl);
    }

    if (lyrics) formData.append('lyrics', lyrics);
    if (prompt) formData.append('prompt', prompt);
    if (gender) formData.append('gender', gender);
    if (style) formData.append('style', style);

    return api.post('/remix/start', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// OneShot API
export const oneShotAPI = {
  startOneShot: (prompt, audioLength = 30) =>
    api.post('/oneshot/start', { prompt, audio_length: audioLength })
};

export default api;