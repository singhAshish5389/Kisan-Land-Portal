import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('farmer_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // Set default axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
      } catch (e) {
        console.error('Error parsing stored auth session', e);
        localStorage.removeItem('farmer_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (mobile, password) => {
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { mobile, password });
      const data = response.data;
      setUser(data);
      localStorage.setItem('farmer_user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (name, mobile, password) => {
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, { name, mobile, password });
      const data = response.data;
      setUser(data);
      localStorage.setItem('farmer_user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
    } catch (err) {
      console.warn('Backend logout warning:', err.message);
    } finally {
      setUser(null);
      localStorage.removeItem('farmer_user');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const updateProfile = async (formData) => {
    setError(null);
    try {
      // Set multipart header explicitly just in case
      const response = await axios.put(`${API_BASE_URL}/auth/profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = response.data;
      
      // Update stored state (keep token from current session if missing in response)
      const updatedUser = {
        ...user,
        name: data.name,
        mobile: data.mobile,
        profilePhoto: data.profilePhoto,
        token: data.token || user.token,
      };
      
      setUser(updatedUser);
      localStorage.setItem('farmer_user', JSON.stringify(updatedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${updatedUser.token}`;
      return updatedUser;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile details.';
      setError(msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateProfile, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
