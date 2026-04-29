import React, { createContext, useState, useContext, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On mount, check if token exists and fetch user
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('fetchUser error:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  /* ─── Register by email ─── */
  const registerByEmail = async (formData) => {
    const res = await fetch(`${API_URL}/register/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    return res.json();
  };

  /* ─── Register by phone: send OTP ─── */
  const registerPhoneSendOtp = async (phone) => {
    const res = await fetch(`${API_URL}/register/phone/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return res.json();
  };

  /* ─── Register by phone: verify OTP ─── */
  const registerPhoneVerifyOtp = async (phone, code) => {
    const res = await fetch(`${API_URL}/register/phone/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    return res.json();
  };

  /* ─── Register by phone: complete profile ─── */
  const registerPhoneComplete = async (formData) => {
    const res = await fetch(`${API_URL}/register/phone/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  /* ─── Verify email OTP ─── */
  const verifyEmailOtp = async (email, code) => {
    const res = await fetch(`${API_URL}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  /* ─── Resend OTP ─── */
  const resendOtp = async (identifier, type, purpose = 'register') => {
    const res = await fetch(`${API_URL}/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, type, purpose }),
    });
    return res.json();
  };

  /* ─── Login by email ─── */
  const loginByEmail = async (email, password) => {
    const res = await fetch(`${API_URL}/login/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  /* ─── Login by phone (password) ─── */
  const loginByPhone = async (phone, password) => {
    const res = await fetch(`${API_URL}/login/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  /* ─── Login by phone: send OTP ─── */
  const loginPhoneSendOtp = async (phone) => {
    const res = await fetch(`${API_URL}/login/phone/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return res.json();
  };

  /* ─── Login by phone: verify OTP ─── */
  const loginPhoneVerifyOtp = async (phone, code) => {
    const res = await fetch(`${API_URL}/login/phone/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  /* ─── Update profile ─── */
  const updateProfile = async (formData) => {
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
    }
    return data;
  };

  /* ─── Get dashboard data ─── */
  const getDashboardData = async () => {
    const res = await fetch('http://localhost:5000/api/dashboard/data', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  };

  /* ─── Logout ─── */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    registerByEmail,
    registerPhoneSendOtp,
    registerPhoneVerifyOtp,
    registerPhoneComplete,
    verifyEmailOtp,
    resendOtp,
    loginByEmail,
    loginByPhone,
    loginPhoneSendOtp,
    loginPhoneVerifyOtp,
    updateProfile,
    getDashboardData,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
