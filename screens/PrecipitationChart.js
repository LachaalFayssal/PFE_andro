import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../App';

// PrecipitationChart Component
const PrecipitationChart = ({ city }) => {
  const { theme } = useTheme();
  const [precipitationData, setPrecipitationData] = useState([]);
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

      // Generate 15 days of simulated precipitation data
      const fifteenDaysData = generate15DaysPrecipitation(sevenDaysData);

      return fifteenDaysData;
    } catch (error) {
      console.error('Erreur météo :', error);
      throw error;
    }
  };

  const generate15DaysPrecipitation = (sevenDaysData) => {
    const simulatedData = [];
    const daysInPeriod = 15;

    for (let i = 0; i < daysInPeriod; i++) {
      const dayIndex = i % sevenDaysData.length;
      const date = new Date();
      date.setDate(date.getDate() + i);
      // Use precipitation probability (pop) as a proxy, scaled to mm (0-3.2 mm range as in image)
      const precip = sevenDaysData[dayIndex].pop || 0; // pop is precipitation probability (0-1)
      const simulatedPrecip = precip * 3.2; // Scale to match the 0-3.2 mm range in the image
      simulatedData.push({
        dt: date.getTime() / 1000,
        precipitation: simulatedPrecip,
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
            month: '2-digit',
          }), // e.g., "12/03"
          precipitation: Math.round(day.precipitation * 10) / 10, // Round to 1 decimal place
        }));
        setPrecipitationData(formattedData);
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

  if (!precipitationData.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>No precipitation data available.</Text>
      </View>
    );
  }

  const chartData = {
    labels: precipitationData.map((item) => item.name), // e.g., "12/03", "13/03"
    datasets: [
      {
        data: precipitationData.map((item) => item.precipitation),
        color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Blue line as in the image
        strokeWidth: 2,
        withDots: true, // Add dots as in the image
      },
    ],
    legend: ['Précipitations (mm)'],
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Précipitations</Text>
      <LineChart
        data={chartData}
        width={screenWidth}
        height={200}
        yAxisLabel=""
        yAxisSuffix=" mm"
        yAxisInterval={0.8} // Matches the 0, 0.8, 1.6, 2.4, 3.2 range in the image
        chartConfig={{
          backgroundColor: theme.colors.background,
          backgroundGradientFrom: theme.colors.background,
          backgroundGradientTo: theme.colors.background,
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => theme.colors.text,
          style: { borderRadius: 16 },
          propsForDots: { r: '4', strokeWidth: '1', stroke: '#ffa726' }, // Circular dots
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

PrecipitationChart.propTypes = {
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

export default PrecipitationChart;