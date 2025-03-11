import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../App';

const HourlyWeather = ({ city }) => {
  const { theme } = useTheme();
  const [weatherData, setWeatherData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cardWidth = 160;
  const flatListRef = useRef(null); // Add ref to control FlatList scrolling

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=bd5e378503939ddaee76f12ad7a97608&units=metric`
        );
        if (!response.ok) {
          throw new Error('Unable to fetch weather data.');
        }
        const data = await response.json();
        const formattedData = data.list.slice(0, 24).map((item) => ({
          time: new Date(item.dt * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          temp: item.main.temp,
          condition: item.weather[0].main.toLowerCase(),
          icon: item.weather[0].icon,
          precip: item.pop * 100 || 0,
          waves: (item.main.sea_level || 1013) / 1000,
          wind: item.wind.speed,
          windDir: item.wind.deg,
        }));
        setWeatherData(formattedData);
      } catch (err) {
        console.error('Error fetching weather data: ', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchWeatherData();
    }
  }, [city]);

  const handleNext = () => {
    const nextIndex = Math.min(currentIndex + 1, weatherData.length - 1);
    setCurrentIndex(nextIndex);
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  };

  const handlePrev = () => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(prevIndex);
    flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderWeatherCard = ({ item, index }) => {
    const isActive = index === currentIndex;

    return (
      <View
        style={[
          styles.timeCard,
          isActive && styles.activeCard,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={[styles.time, { color: theme.colors.text }]}>{item.time}</Text>
        <Text style={[styles.temp, { color: theme.colors.text }]}>{item.temp}°C</Text>
        <Image
          source={{ uri: `http://openweathermap.org/img/wn/${item.icon}@2x.png` }}
          style={styles.weatherIcon}
        />
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Icon name="water-drop" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>🌧️ {item.precip}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="waves" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>🌊 {item.waves.toFixed(2)}m</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="air" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>🧭 {item.wind} km/h {item.windDir}°</Text>
          </View>
        </View>
      </View>
    );
  };

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

  if (!weatherData.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>No weather data available.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.weatherContainer, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.colors.primary }]}>
          {weatherData[currentIndex]?.time || 'Loading...'}
        </Text>
      </View>
      <View style={styles.scrollWrapper}>
        <TouchableOpacity
          onPress={handlePrev}
          disabled={currentIndex === 0}
          style={[styles.navButton, styles.prevButton, currentIndex === 0 && styles.disabledButton]}
        >
          <Text style={styles.navButtonText}>❮</Text>
        </TouchableOpacity>
        <FlatList
          ref={flatListRef}
          data={weatherData}
          renderItem={renderWeatherCard}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + 10}
          decelerationRate="fast"
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50,
          }}
          onViewableItemsChanged={onViewableItemsChanged}
          getItemLayout={(data, index) => ({
            length: cardWidth + 10,
            offset: (cardWidth + 10) * index,
            index,
          })}
          style={styles.scrollContainer}
        />
        <TouchableOpacity
          onPress={handleNext}
          disabled={currentIndex === weatherData.length - 1}
          style={[styles.navButton, styles.nextButton, currentIndex === weatherData.length - 1 && styles.disabledButton]}
        >
          <Text style={styles.navButtonText}>❯</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

HourlyWeather.propTypes = {
  city: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
  weatherContainer: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollWrapper: {
    position: 'relative',
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 0,
  },
  timeCard: {
    width: 160,
    margin: 5,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: '#00BFFF',
    transform: [{ scale: 1.1 }],
  },
  weatherIcon: {
    width: 70,
    height: 70,
    marginVertical: 10,
  },
  time: {
    fontSize: 16,
    marginBottom: 5,
  },
  temp: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  details: {
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 5,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: '#00BFFF',
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  prevButton: {
    left: 0,
  },
  nextButton: {
    right: 0,
  },
  navButtonText: {
    color: 'white',
    fontSize: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
});

export default HourlyWeather;