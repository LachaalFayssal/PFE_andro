import React, { createContext, useState, useContext, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Searchbar, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WeatherCard from './screens/WeatherCard';
import HourlyWeather from './screens/HourlyWeather'; // Import the new component

// Contexte pour le thèmem
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
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personnalisé pour utiliser le thème
const useTheme = () => useContext(ThemeContext);

// Custom hook to provide theme to components
export { useTheme };

// Composant de la barre de navigation personnalisée
const CustomHeader = ({ navigation }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Icon name="menu" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        <Image
          source={require('./assets/logo.png')} // Update path to your logo
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: theme.colors.primary }]}>Météo</Text>
      </View>
      <TouchableOpacity onPress={toggleTheme}>
        <Icon
          name={theme.isDarkTheme ? 'brightness-7' : 'brightness-3'}
          size={24}
          color={theme.colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};

// Configuration du Drawer Navigator
const Drawer = createDrawerNavigator();

// Composants des écrans
const DashboardScreen = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('Casablanca');

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    // The WeatherCard and HourlyWeather will fetch data for the new city
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Search Bar */}
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

      {/* Weather Card */}
      <WeatherCard city={searchQuery} theme={theme} />

      {/* Hourly Weather */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Prévisions Horaires</Text>
      <HourlyWeather city={searchQuery} />
    </ScrollView>
  );
};

const ClimateHistoryScreen = () => {
  const { theme } = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text, fontSize: 20, padding: 10 }}>Historique Climatique</Text>
    </ScrollView>
  );
};

const WeatherMapScreen = () => {
  const { theme } = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text, fontSize: 20, padding: 10 }}>Carte Météo</Text>
    </ScrollView>
  );
};

// Composant principal de l'application
const App = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Drawer.Navigator
          screenOptions={{
            header: ({ navigation }) => <CustomHeader navigation={navigation} />,
            drawerStyle: { backgroundColor: '#f0f0f0' },
          }}
        >
          <Drawer.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              drawerIcon: ({ color, size }) => <Icon name="dashboard" color={color} size={size} />,
              title: 'Tableau de bord',
            }}
          />
          <Drawer.Screen
            name="Climate History"
            component={ClimateHistoryScreen}
            options={{
              drawerIcon: ({ color, size }) => <Icon name="history" color={color} size={size} />,
              title: 'Historique climatique',
            }}
          />
          <Drawer.Screen
            name="Weather Map"
            component={WeatherMapScreen}
            options={{
              drawerIcon: ({ color, size }) => <Icon name="map" color={color} size={size} />,
              title: 'Carte météo',
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
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
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 70,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
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