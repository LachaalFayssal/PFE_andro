import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../Theme'; // Importation depuis Theme.js

const CustomHeader = ({ setCurrentScreen, currentScreen }) => {
  const { theme, toggleTheme } = useTheme();
  const [isNavVisible, setIsNavVisible] = useState(false);

  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

  const handleNavigation = (screen) => {
    setCurrentScreen(screen);
    setIsNavVisible(false); // Ferme la navigation après sélection
  };

  return (
    <View style={styles.headerContainer}>
      <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
        <TouchableOpacity onPress={toggleNav} style={styles.menuButton} accessibilityLabel="Afficher la navigation">
          <Icon name={isNavVisible ? 'close' : 'menu'} size={24} color={theme.colors.text} />
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
      {isNavVisible && (
        <View style={[styles.navContainer, { backgroundColor: theme.colors.headerBackground }]}>
          <TouchableOpacity
            style={[
              styles.navItem,
              currentScreen === 'Dashboard' && { backgroundColor: theme.colors.drawerActiveBackground },
            ]}
            onPress={() => handleNavigation('Dashboard')}
          >
            <Icon
              name="dashboard"
              size={20}
              color={currentScreen === 'Dashboard' ? theme.colors.primary : theme.colors.inactiveIconColor}
            />
            <Text
              style={[
                styles.navText,
                { color: currentScreen === 'Dashboard' ? theme.colors.primary : theme.colors.inactiveIconColor },
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.navItem,
              currentScreen === 'Climate History' && { backgroundColor: theme.colors.drawerActiveBackground },
            ]}
            onPress={() => handleNavigation('Climate History')}
          >
            <Icon
              name="history"
              size={20}
              color={currentScreen === 'Climate History' ? theme.colors.primary : theme.colors.inactiveIconColor}
            />
            <Text
              style={[
                styles.navText,
                { color: currentScreen === 'Climate History' ? theme.colors.primary : theme.colors.inactiveIconColor },
              ]}
            >
              Climate History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.navItem,
              currentScreen === 'Weather Map' && { backgroundColor: theme.colors.drawerActiveBackground },
            ]}
            onPress={() => handleNavigation('Weather Map')}
          >
            <Icon
              name="map"
              size={20}
              color={currentScreen === 'Weather Map' ? theme.colors.primary : theme.colors.inactiveIconColor}
            />
            <Text
              style={[
                styles.navText,
                { color: currentScreen === 'Weather Map' ? theme.colors.primary : theme.colors.inactiveIconColor },
              ]}
            >
              Weather Map
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1001,
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
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuButton: {
    padding: 5,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sunIcon: {
    marginRight: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  navContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginVertical: 5,
    borderRadius: 5,
  },
  navText: {
    fontSize: 16,
    marginLeft: 10,
  },
});

export default CustomHeader;