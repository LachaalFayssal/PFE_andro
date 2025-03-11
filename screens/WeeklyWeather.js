import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../App'; // Adjust the path based on your structure

const WeeklyWeather = ({ city }) => {
  const { theme } = useTheme();
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeeklyForecast = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast/daily?q=${city}&cnt=7&appid=bd5e378503939ddaee76f12ad7a97608&units=metric&lang=fr`
        );
        if (!response.ok) {
          throw new Error('Unable to fetch weekly weather data.');
        }
        const data = await response.json();
        const formattedData = data.list.map((item) => ({
          day: new Date(item.dt * 1000).toLocaleDateString('fr-FR', { weekday: 'long' }),
          temp: Math.round(item.temp.day),
          minTemp: Math.round(item.temp.min),
          maxTemp: Math.round(item.temp.max),
          condition: item.weather[0].description,
          icon: item.weather[0].icon,
        }));
        setForecastData(formattedData);
      } catch (err) {
        console.error('Error fetching weekly weather data: ', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchWeeklyForecast();
    }
  }, [city]);

  const renderDayCard = ({ item }) => (
    <View style={[styles.dayCard, { backgroundColor: theme.colors.background + 'ee' }]}>
      <Text style={[styles.dayText, { color: theme.colors.text }]}>{item.day}</Text>
      <Text style={[styles.tempText, { color: theme.colors.text }]}>{item.temp}°C</Text>
      <Image
        source={{ uri: `http://openweathermap.org/img/wn/${item.icon}@2x.png` }}
        style={styles.weatherIcon}
      />
      <Text style={[styles.minMaxText, { color: theme.colors.text }]}>Min: {item.minTemp}°C</Text>
      <Text style={[styles.minMaxText, { color: theme.colors.text }]}>Max: {item.maxTemp}°C</Text>
      <Text style={[styles.conditionText, { color: theme.colors.text }]}>{item.condition}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
      </View>
    );
  }

  if (!forecastData.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>No weekly forecast available.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>Prévisions Hebdomadaires</Text>
      <FlatList
        data={forecastData}
        renderItem={renderDayCard}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

WeeklyWeather.propTypes = {
  city: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 5,
  },
  dayCard: {
    width: 120,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tempText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  weatherIcon: {
    width: 50,
    height: 50,
    marginVertical: 5,
  },
  minMaxText: {
    fontSize: 14,
    marginVertical: 2,
  },
  conditionText: {
    fontSize: 14,
    textTransform: 'capitalize',
    marginTop: 5,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
});

export default WeeklyWeather;