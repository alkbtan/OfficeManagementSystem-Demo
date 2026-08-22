import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsData {
  organizationName: string;
  currency: string;
  locale: string;
  theme: string;
  notificationsEnabled: boolean;
  darkMode: boolean;
  language: string;
  timezone: string;
  dateFormat: string;
}

interface SettingsContextType {
  settings: SettingsData;
  updateSettings: (newSettings: Partial<SettingsData>) => void;
  resetSettings: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string | Date) => string;
}

const defaultSettings: SettingsData = {
  organizationName: "TestFlyQA",
  currency: "BRL",
  locale: "pt-BR",
  theme: "default",
  notificationsEnabled: true,
  darkMode: false,
  language: "en",
  timezone: "America/Sao_Paulo",
  dateFormat: "DD/MM/YYYY",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    
    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.style.backgroundColor = '#121212';
      document.body.style.backgroundColor = '#121212';
      document.body.style.color = '#ffffff';
    } else {
      document.documentElement.style.backgroundColor = '#f5f7fa';
      document.body.style.backgroundColor = '#f5f7fa';
      document.body.style.color = '#000000';
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<SettingsData>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('app_settings', JSON.stringify(defaultSettings));
  };

  const formatCurrency = (amount: number): string => {
    const currencySymbols: Record<string, string> = {
      BRL: 'R$',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    const symbol = currencySymbols[settings.currency] || 'R$';
    
    try {
      return new Intl.NumberFormat(settings.locale || 'pt-BR', {
        style: 'currency',
        currency: settings.currency || 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (e) {
      return `${symbol} ${amount.toFixed(2)}`;
    }
  };

  const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid date';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    switch (settings.dateFormat) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
      default:
        return `${day}/${month}/${year}`;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, formatCurrency, formatDate }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};