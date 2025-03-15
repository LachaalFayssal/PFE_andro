import React, { createContext, useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import { Searchbar, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WeatherCard from './screens/WeatherCard';
import HourlyWeather from './screens/HourlyWeather';
import WeeklyWeather from './screens/WeeklyWeather';
import WindSpeedChart from './screens/WindSpeedChart';
import PrecipitationChart from './screens/PrecipitationChart';
import WeatherMap from './screens/WeatherMapScreen'; // Assurez-vous que le chemin est correct
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
export { useTheme };

// Web Sidebar Content
const WebSidebar = ({ isOpen, toggleSidebar, setCurrentScreen, currentScreen }) => {
  const { theme } = useTheme();
  const slideAnim = useState(new Animated.Value(isOpen ? 0 : -240))[0];

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -240,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  if (!isOpen && slideAnim.__getValue() === -240) return null;

  const handleNavigation = (screen) => {
    setCurrentScreen(screen);
    toggleSidebar();
  };

  return (
    <Animated.View
      style={[
        styles.webSidebar,
        { backgroundColor: theme.colors.drawerBackground, transform: [{ translateX: slideAnim }] },
      ]}
    >
      <TouchableOpacity onPress={toggleSidebar} style={styles.closeButton}>
        <Icon name="close" size={24} color={theme.colors.text} accessibilityLabel="Fermer la barre latérale" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.drawerItem,
          currentScreen === 'Dashboard' && { backgroundColor: theme.colors.drawerActiveBackground },
        ]}
        onPress={() => handleNavigation('Dashboard')}
      >
        <Icon name="dashboard" size={20} color={currentScreen === 'Dashboard' ? theme.colors.primary : theme.colors.inactiveIconColor} />
        <Text style={[styles.drawerItemText, { color: currentScreen === 'Dashboard' ? theme.colors.primary : theme.colors.inactiveIconColor }]}>Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.drawerItem,
          currentScreen === 'Climate History' && { backgroundColor: theme.colors.drawerActiveBackground },
        ]}
        onPress={() => handleNavigation('Climate History')}
      >
        <Icon name="history" size={20} color={currentScreen === 'Climate History' ? theme.colors.primary : theme.colors.inactiveIconColor} />
        <Text style={[styles.drawerItemText, { color: currentScreen === 'Climate History' ? theme.colors.primary : theme.colors.inactiveIconColor }]}>Climate History</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.drawerItem,
          currentScreen === 'Weather Map' && { backgroundColor: theme.colors.drawerActiveBackground },
        ]}
        onPress={() => handleNavigation('Weather Map')}
      >
        <Icon name="map" size={20} color={currentScreen === 'Weather Map' ? theme.colors.primary : theme.colors.inactiveIconColor} />
        <Text style={[styles.drawerItemText, { color: currentScreen === 'Weather Map' ? theme.colors.primary : theme.colors.inactiveIconColor }]}>Weather Map</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Custom Header Component
const CustomHeader = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
      <TouchableOpacity
        onPress={() => {
          console.log('Menu button pressed');
          toggleSidebar();
        }}
        style={styles.menuButton}
        accessibilityLabel="Ouvrir la barre latérale"
      >
        <Icon name="menu" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        <Icon name="wb-sunny" size={24} color="#ff9800" style={styles.sunIcon} />
        <Text style={[styles.title, { color: theme.colors.primary }]}>Météo</Text>
      </View>
      <TouchableOpacity onPress={toggleTheme} accessibilityLabel="Basculer le thème">
        <Icon
          name={theme.isDarkTheme ? 'brightness-7' : 'brightness-3'}
          size={24}
          color={theme.colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};

// Écrans
const DashboardScreen = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('Casablanca');

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Rechercher une ville"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <Button mode="contained" onPress={handleSearch} style={styles.searchButton}>
          RECHERCHER
        </Button>
      </View>
      <WeatherCard city={searchQuery} theme={theme} />
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Prévisions Horaires</Text>
      <HourlyWeather city={searchQuery} />
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Prévisions Hebdomadaires</Text>
      <WeeklyWeather city={searchQuery} />
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Graphique Vitesse du Vent</Text>
      <WindSpeedChart city={searchQuery} />
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Graphique Précipitations</Text>
      <PrecipitationChart city={searchQuery} />
    </ScrollView>
  );
};

const ClimateHistoryScreen = () => {
  const { theme } = useTheme();
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ color: theme.colors.text, fontSize: 20, padding: 10 }}>Historique Climatique</Text>
    </ScrollView>
  );
};

const WeatherMapScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ color: theme.colors.text, fontSize: 20, padding: 10 }}>Carte Météo</Text>
      <WeatherMap />
    </View>
  );
};

// Application principale
const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('Dashboard');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Dashboard':
        return <DashboardScreen />;
      case 'Climate History':
        return <ClimateHistoryScreen />;
      case 'Weather Map':
        return <WeatherMapScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <ThemeProvider>
      <View style={styles.appContainer}>
        {/* Header fixé */}
        <CustomHeader toggleSidebar={toggleSidebar} />
        {/* Sidebar fixée */}
        <WebSidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          setCurrentScreen={setCurrentScreen}
          currentScreen={currentScreen}
        />
        {/* Contenu principal dans un ScrollView */}
        <ScrollView style={styles.mainContent}>
          {renderScreen()}
        </ScrollView>
      </View>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#ffffff', // Fond de l'application
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    height: 60, // Hauteur fixe du header
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    position: 'fixed', // Header fixé
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1001, // Au-dessus de tout
  },
  menuButton: {
    padding: 5,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sunIcon: {
    marginRight: 5,
  },
  webSidebar: {
    width: 240,
    height: '100%', // Toute la hauteur
    position: 'fixed', // Sidebar fixée
    left: 0,
    top: 10, // Commence en haut
    zIndex: 1000, // Sous le header, au-dessus du contenu
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 10,
  },
  mainContent: {
    flex: 1,
    marginTop: 60, // Marge pour la hauteur du header
    backgroundColor: '#ffffff', // Fond du contenu
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  searchBar: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  searchButton: {
    backgroundColor: '#007AFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
  },
});

export default App;