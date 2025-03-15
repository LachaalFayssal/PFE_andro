import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Contexte pour le thème
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme !== null) {
        setIsDarkTheme(JSON.parse(storedTheme));
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    await AsyncStorage.setItem('theme', JSON.stringify(newTheme));
  };

  const theme = {
    isDarkTheme,
    colors: {
      background: isDarkTheme ? '#121212' : '#ffffff',
      text: isDarkTheme ? '#ffffff' : '#000000',
      primary: isDarkTheme ? '#bb86fc' : '#6200ee',
      drawerBackground: isDarkTheme ? '#1a1a1a' : '#ffffff',
      drawerActiveBackground: '#e3f2fd',
      headerBackground: isDarkTheme ? '#1a1a1a' : '#f0f0f0',
      inactiveIconColor: isDarkTheme ? '#888' : '#757575',
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

export { ThemeProvider, useTheme };