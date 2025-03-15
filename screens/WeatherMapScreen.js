import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from 'react-native-paper';
import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
import axios from 'axios';
import { useTheme } from '../components/ThemeProvider';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Liste des villes à afficher sur la carte
const CITIES = [
  { name: 'Casablanca', coords: { latitude: 33.5731, longitude: -7.5898 } },
  { name: 'Rabat', coords: { latitude: 34.0209, longitude: -6.8416 } },
  { name: 'Marrakech', coords: { latitude: 31.6295, longitude: -7.9811 } },
];

const WeatherMapScreen = () => {
  const { theme } = useTheme();
  const [overlay, setOverlay] = useState('wind'); // Overlay actif (vent, temp, pluie)
  const [weatherData, setWeatherData] = useState([]); // Données météo pour plusieurs villes
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Récupérer les données météo pour chaque ville
  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises = CITIES.map(async (city) => {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=bd5e378503939ddaee76f12ad7a97608&units=metric`
          );
          return { city: city.name, coords: city.coords, data: response.data };
        });
        const results = await Promise.all(promises);
        setWeatherData(results);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Erreur lors de la récupération des données météo');
      } finally {
        setLoading(false);
      }
    };
    fetchWeatherData();
  }, []);

  const changeOverlay = (newOverlay) => {
    console.log(`Changing overlay to: ${newOverlay}`);
    setOverlay(newOverlay);
  };

  // Déterminer la couleur du cercle en fonction des valeurs
  const getOverlayColor = (value, type) => {
    if (type === 'temp') {
      // Température : bleu (froid) -> rouge (chaud)
      if (value < 10) return 'rgba(0, 0, 255, 0.2)';
      if (value < 20) return 'rgba(0, 255, 255, 0.2)';
      return 'rgba(255, 0, 0, 0.2)';
    } else if (type === 'precipitation') {
      // Précipitations : bleu clair (peu) -> bleu foncé (beaucoup)
      if (value < 1) return 'rgba(0, 0, 255, 0.1)';
      if (value < 5) return 'rgba(0, 0, 255, 0.3)';
      return 'rgba(0, 0, 255, 0.5)';
    } else if (type === 'wind') {
      // Vent : vert (léger) -> violet (fort)
      if (value < 5) return 'rgba(0, 255, 0, 0.2)';
      if (value < 10) return 'rgba(255, 255, 0, 0.2)';
      return 'rgba(128, 0, 128, 0.2)';
    }
    return 'rgba(0, 0, 0, 0.2)';
  };

  // Rendre les superpositions météo pour chaque ville
  const renderWeatherOverlay = () => {
    if (!weatherData || weatherData.length === 0) return null;

    return weatherData.map((cityWeather, index) => {
      const { coords, data } = cityWeather;
      const position = { latitude: coords.latitude, longitude: coords.longitude };
      const { wind, main, rain } = data;

      switch (overlay) {
        case 'wind':
          return (
            <Marker key={`wind-${index}`} coordinate={position} title={`Vitesse du vent: ${wind.speed} m/s`}>
              <View style={styles.markerContainer}>
                <Icon name="weather-windy" size={30} color="#00f" />
              </View>
              <Circle
                center={position}
                radius={50000}
                strokeColor="rgba(0, 0, 255, 0.5)"
                fillColor={getOverlayColor(wind.speed, 'wind')}
              />
            </Marker>
          );
        case 'temp':
          return (
            <Circle
              key={`temp-${index}`}
              center={position}
              radius={50000}
              strokeColor="rgba(255, 0, 0, 0.5)"
              fillColor={getOverlayColor(main.temp, 'temp')}
            >
              <Marker coordinate={position} title={`Température: ${main.temp} °C`} />
            </Circle>
          );
        case 'precipitation':
          const precipitation = rain ? rain['1h'] || 0 : 0;
          return (
            <Circle
              key={`precip-${index}`}
              center={position}
              radius={50000}
              strokeColor="rgba(0, 0, 255, 0.5)"
              fillColor={getOverlayColor(precipitation, 'precipitation')}
            >
              <Marker coordinate={position} title={`Précipitations: ${precipitation} mm`} />
            </Circle>
          );
        default:
          return null;
      }
    });
  };

  return (
    <View style={{ flex: 1, paddingTop: 10 }}>
      <View style={styles.overlayButtons}>
        <Button
          mode="contained"
          onPress={() => changeOverlay('wind')}
          style={[styles.overlayButton, overlay === 'wind' && styles.activeButton]}
        >
          Vent
        </Button>
        <Button
          mode="contained"
          onPress={() => changeOverlay('temp')}
          style={[styles.overlayButton, overlay === 'temp' && styles.activeButton]}
        >
          Température
        </Button>
        <Button
          mode="contained"
          onPress={() => changeOverlay('precipitation')}
          style={[styles.overlayButton, overlay === 'precipitation' && styles.activeButton]}
        >
          Pluie
        </Button>
      </View>
      {loading ? (
        <Text style={styles.loadingText}>Chargement des données météo...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={{
            latitude: 34.02,
            longitude: -6.83,
            latitudeDelta: 10,
            longitudeDelta: 10,
          }}
        >
          {/* Marqueurs de base pour chaque ville */}
          {CITIES.map((city, index) => (
            <Marker
              key={`city-${index}`}
              coordinate={city.coords}
              title={city.name}
            />
          ))}
          {/* Superpositions météo */}
          {renderWeatherOverlay()}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlayButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    padding: 10,
  },
  overlayButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#007AFF',
  },
  activeButton: {
    backgroundColor: '#005BB5',
  },
  map: {
    flex: 1,
    height: 400,
    width: '100%',
  },
  markerContainer: {
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  loadingText: {
    color: theme.colors.text,
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default WeatherMapScreen;