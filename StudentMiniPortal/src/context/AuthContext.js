// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../api/authApi';

const STORAGE_KEY = 'biit_portal_session';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // session shape: { user: {id,name,email,role}, student?: {...}, admin?: {...} }
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSession(JSON.parse(raw));
      } catch (e) {
        console.warn('Failed to restore session', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email, password, role) => {
    const data = await authApi.login(email, password, role); // throws on failure
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSession(data);
    return data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  // Call after StudentEditProfile / OTP verification updates local fields
  const updateSession = async (patch) => {
    setSession((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout, updateSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
