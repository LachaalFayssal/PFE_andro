import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart } from 'react-native-chart-kit'; // Chart component

const WeatherCard = ({ city, theme }) => {
  const [activeTab, setActiveTab] = useState('aujourdhui');
  const [weatherData, setWeatherData] = useState(null);
  const [tomorrowData, setTomorrowData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const [weatherResponse, forecastResponse] = await Promise.all([
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=bd5e378503939ddaee76f12ad7a97608&units=metric&lang=fr`
          ),
          fetch(
            `https://api.openweathermap.org/data/2.5/forecast/daily?q=${city}&cnt=15&appid=bd5e378503939ddaee76f12ad7a97608&units=metric&lang=fr`
          ),
        ]);

        const weatherResult = await weatherResponse.json();
        const forecastResult = await forecastResponse.json();

        if (weatherResult.cod !== 200 || forecastResult.cod !== '200') {
          throw new Error('Ville non trouvée ou erreur API');
        }

        setWeatherData({
          name: weatherResult.name,
          temp: weatherResult.main.temp,
          description: weatherResult.weather[0].description,
          icon: weatherResult.weather[0].icon,
          maxTemp: weatherResult.main.temp_max,
          minTemp: weatherResult.main.temp_min,
          humidity: weatherResult.main.humidity,
          windSpeed: weatherResult.wind.speed,
          windDir: weatherResult.wind.deg,
          sunrise: new Date(weatherResult.sys.sunrise * 1000).toLocaleTimeString(),
          sunset: new Date(weatherResult.sys.sunset * 1000).toLocaleTimeString(),
        });

        if (forecastResult.list.length >= 2) {
          setTomorrowData(forecastResult.list[1]);
        }

        const formattedForecast = forecastResult.list.map((item) => ({
          date: new Date(item.dt * 1000).toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
          }),
          tempMin: item.temp.min,
          tempMax: item.temp.max,
        }));
        setForecastData(formattedForecast);
      } catch (error) {
        console.error('Erreur lors de la récupération des données météo:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [city]);

  const screenWidth = Dimensions.get('window').width - 40; // Adjusted for padding

  return (
    <View style={[styles.cardContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.text + '20' }]}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('aujourdhui')}
          style={[styles.tab, activeTab === 'aujourdhui' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'aujourdhui' && { color: theme.colors.primary }]}>AUJOURD'HUI</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('demain')}
          style={[styles.tab, activeTab === 'demain' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'demain' && { color: theme.colors.primary }]}>DEMAIN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('prevision')}
          style={[styles.tab, activeTab === 'prevision' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'prevision' && { color: theme.colors.primary }]}>PRÉVISIONS 15 JOURS</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : error ? (
        <Text style={[styles.weatherTitle, { color: 'red' }]}>{error}</Text>
      ) : (
        <View style={styles.tabContent}>
          {activeTab === 'aujourdhui' && weatherData && (
            <View style={styles.weatherContent}>
              <Text style={[styles.weatherTitle, { color: theme.colors.text }]}>Aujourd'hui - {weatherData.name}</Text>
              <Image
                source={{ uri: `http://openweathermap.org/img/wn/${weatherData.icon}@2x.png` }}
                style={styles.weatherIcon}
              />
              <Text style={[styles.temperature, { color: theme.colors.text }]}>{weatherData.temp}°C</Text>
              <Text style={[styles.condition, { color: theme.colors.text }]}>{weatherData.description}</Text>
              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Icon name="wb-sunny" size={20} color={theme.colors.primary} />
                  <Text style={[styles.statText, { color: theme.colors.text }]}>{weatherData.maxTemp}°C</Text>
                </View>
                <View style={styles.stat}>
                  <Icon name="brightness-3" size={20} color={theme.colors.primary} />
                  <Text style={[styles.statText, { color: theme.colors.text }]}>{weatherData.minTemp}°C</Text>
                </View>
              </View>
            </View>
          )}
          {activeTab === 'demain' && tomorrowData && (
            <View style={styles.weatherContent}>
              <Text style={[styles.weatherTitle, { color: theme.colors.text }]}>Demain - {weatherData?.name}</Text>
              <Image
                source={{ uri: `http://openweathermap.org/img/wn/${tomorrowData.weather[0].icon}@2x.png` }}
                style={styles.weatherIcon}
              />
              <Text style={[styles.temperature, { color: theme.colors.text }]}>{tomorrowData.temp.day}°C</Text>
              <Text style={[styles.condition, { color: theme.colors.text }]}>{tomorrowData.weather[0].description}</Text>
              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Icon name="wb-sunny" size={20} color={theme.colors.primary} />
                  <Text style={[styles.statText, { color: theme.colors.text }]}>{tomorrowData.temp.max}°C</Text>
                </View>
                <View style={styles.stat}>
                  <Icon name="brightness-3" size={20} color={theme.colors.primary} />
                  <Text style={[styles.statText, { color: theme.colors.text }]}>{tomorrowData.temp.min}°C</Text>
                </View>
              </View>
            </View>
          )}
          {activeTab === 'prevision' && (
            <View style={styles.forecastContainer}>
              <Text style={[styles.weatherTitle, { color: theme.colors.text }]}>Prévisions 15 jours</Text>
              {forecastData.length > 0 ? (
                <LineChart
                  data={{
                    labels: forecastData.map(item => item.date),
                    datasets: [
                      {
                        data: forecastData.map(item => item.tempMax),
                        color: () => '#ff7300', // Orange for max temperature
                        strokeWidth: 2,
                      },
                      {
                        data: forecastData.map(item => item.tempMin),
                        color: () => '#0088FE', // Blue for min temperature
                        strokeWidth: 2,
                      },
                    ],
                    legend: ['Max (°C)', 'Min (°C)'],
                  }}
                  width={screenWidth}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix="°C"
                  yAxisInterval={5} // Matches the 5-unit intervals in the screenshot
                  chartConfig={{
                    backgroundColor: theme.colors.background,
                    backgroundGradientFrom: theme.colors.background,
                    backgroundGradientTo: theme.colors.background,
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => theme.colors.text,
                    style: {
                      borderRadius: 16,
                      paddingRight: 0,
                    },
                    propsForDots: {
                      r: '4',
                      strokeWidth: '1',
                      stroke: '#ffa726',
                    },
                  }}
                  bezier // Adds smooth curves like in the screenshot
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                    paddingRight: 0,
                  }}
                />
              ) : (
                <Text style={[styles.weatherTitle, { color: theme.colors.text }]}>Données insuffisantes</Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

WeatherCard.propTypes = {
  city: PropTypes.string.isRequired,
  theme: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  cardContainer: {
    margin: 10,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabContent: {
    alignItems: 'center',
  },
  loader: {
    marginVertical: 20,
  },
  weatherContent: {
    alignItems: 'center',
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  weatherIcon: {
    width: 80,
    height: 80,
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  condition: {
    fontSize: 16,
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 5,
  },
  forecastContainer: {
    width: '100',
    alignItems: 'center',
  },
});

export default WeatherCard;