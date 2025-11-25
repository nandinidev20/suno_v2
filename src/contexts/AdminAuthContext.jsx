import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

  // Set up axios defaults for admin API calls
  useEffect(() => {
    if (adminToken) {
      // Create a separate axios instance for admin calls
      const adminAxios = axios.create({
        baseURL: '/api/admin',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Verify admin token by getting profile
      adminAxios.get('/profile')
        .then(response => {
          setAdmin(response.data.data);
        })
        .catch(() => {
          localStorage.removeItem('adminToken');
          setAdminToken(null);
          setAdmin(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [adminToken]);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/admin/login', { username, password });
      const { token, admin: adminData } = response.data.data;
      
      localStorage.setItem('adminToken', token);
      setAdminToken(token);
      setAdmin(adminData);
      
      toast.success('Admin login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Admin login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      // Try to call logout API if we have a token
      if (adminToken) {
        const adminAxios = axios.create({
          baseURL: '/api/admin',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        await adminAxios.post('/logout');
      }
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      setAdminToken(null);
      setAdmin(null);
      toast.success('Admin logged out successfully');
    }
  };

  const value = {
    admin,
    loading,
    login,
    logout,
    isAuthenticated: !!admin,
    adminToken
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
