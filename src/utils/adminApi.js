import axios from 'axios';

// Create axios instance for admin API calls
export const createAdminApi = (adminToken) => {
  return axios.create({
    baseURL: '/api/admin',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
  });
};

// API functions that require admin token
export const adminApiService = {
  // Users
  getUsers: (adminToken) => createAdminApi(adminToken).get('/users'),
  updateUser: (adminToken, userId, userData) => createAdminApi(adminToken).put(`/users/${userId}`, userData),
  deleteUser: (adminToken, userId) => createAdminApi(adminToken).delete(`/users/${userId}`),
  getUserStats: (adminToken) => createAdminApi(adminToken).get('/users/stats'),
  
  // Tracks
  getTracks: (adminToken) => createAdminApi(adminToken).get('/tracks'),
  deleteTrack: (adminToken, trackId) => createAdminApi(adminToken).delete(`/tracks/${trackId}`),
  
  // Profile
  getProfile: (adminToken) => createAdminApi(adminToken).get('/profile'),
};
