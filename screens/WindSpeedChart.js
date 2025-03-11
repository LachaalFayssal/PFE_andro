import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../App';

// WindSpeedChart Component
const WindSpeedChart = ({ city }) => {
  const { theme } = useTheme();
  const [windSpeedData, setWindSpeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const screenWidth = Dimensions.get('window').width - 40; // Adjusted for padding

  // Function to fetch weather data and generate 15-day forecast
  const get15DaysWeather = async (city) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=bd5e378503939ddaee76f12ad7a97608&units=metric`
      );
      if (!response.ok) {
        throw new Error('Unable to fetch weather data.');
      }
      const data = await response.json();

      // Filter to get 7 days (one data point per day, every 8 entries of 3-hour intervals)
      const sevenDaysData = data.list
        .filter((item, index) => index % 8 === 0)
        .slice(0, 7);

      // Generate 15 days of simulated wind speed data
      const fifteenDaysData = generate15DaysForecast(sevenDaysData);

      return fifteenDaysData;
    } catch (error) {
      console.error('Erreur météo :', error);
      throw error;
    }
  };

  const generate15DaysForecast = (sevenDaysData) => {
    const simulatedData = [];
    const daysInPeriod = 15;

    for (let i = 0; i < daysInPeriod; i++) {
      const dayIndex = i % sevenDaysData.length;
      const date = new Date();
      date.setDate(date.getDate() + i);
      simulatedData.push({
        dt: date.getTime() / 1000,
        windSpeed: sevenDaysData[dayIndex].wind.speed || 0, // Fallback to 0 if wind speed is missing
      });
    }

    return simulatedData;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const weatherData = await get15DaysWeather(city);
        const formattedData = weatherData.map((day) => ({
          name: new Date(day.dt * 1000).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
          }),
          windSpeed: Math.round(day.windSpeed * 3.6), // Convert m/s to km/h
        }));
        setWindSpeedData(formattedData);
      } catch (error) {
        console.error('Erreur :', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchData();
    }
  }, [city]);

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

  if (!windSpeedData.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>No wind speed data available.</Text>
      </View>
    );
  }

  const chartData = {
    labels: windSpeedData.map((item) => item.name), // e.g., "12 mars", "15 mars"
    datasets: [
      {
        data: windSpeedData.map((item) => item.windSpeed),
        color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Blue line as in the image
        strokeWidth: 2,
      },
    ],
    legend: ['Vitesse du vent (km/h)'],
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Vitesse du vent</Text>
      <LineChart
        data={chartData}
        width={screenWidth}
        height={200}
        yAxisLabel=""
        yAxisSuffix=" km/h"
        yAxisInterval={3} // Matches the 0, 3, 6, 9, 12 range in the image
        chartConfig={{
          backgroundColor: theme.colors.background,
          backgroundGradientFrom: theme.colors.background,
          backgroundGradientTo: theme.colors.background,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => theme.colors.text,
          style: { borderRadius: 16 },
          propsForDots: { r: '4', strokeWidth: '1', stroke: '#ffa726' },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

WindSpeedChart.propTypes = {
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
    marginTop: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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

export default WindSpeedChart;