import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decoded);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = (token) => {
    console.log('🔐 AuthContext login called with token:', token?.substring(0, 20) + '...');
    try {
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      console.log('🔐 Token decoded successfully:', decoded);
      setUser(decoded);
      setIsAuthenticated(true);
      console.log('🔐 User authenticated:', decoded.email);
    } catch (error) {
      console.error('🔐 Error during login:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🔐 Logging out user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('selectedType');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export useAuth separately to fix React Fast Refresh warning
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
