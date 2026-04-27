import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartdrop_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await api.get('/users/me');
          setUser(data.user);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/users/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('smartdrop_token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/users/register', payload);
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('smartdrop_token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartdrop_token');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
