// ThemeContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, ThemeContextType } from './types';

export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: {} as ThemeColors,
  toggleTheme: () => {},
  currency: 'USD',
  setCurrency: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [currency, setCurrency] = useState('USD');

  const lightColors: ThemeColors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  };

  const darkColors: ThemeColors = {
    primary: '#818cf8',
    secondary: '#a78bfa',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171'
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const theme = await AsyncStorage.getItem('theme');
      const curr = await AsyncStorage.getItem('currency');
      if (theme) setIsDark(theme === 'dark');
      if (curr) setCurrency(curr);
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const updateCurrency = async (newCurrency: string) => {
    setCurrency(newCurrency);
    await AsyncStorage.setItem('currency', newCurrency);
  };

  return (
    <ThemeContext.Provider value={{
      isDark,
      colors: isDark ? darkColors : lightColors,
      toggleTheme,
      currency,
      setCurrency: updateCurrency
    }}>
      {children}
    </ThemeContext.Provider>
  );
};