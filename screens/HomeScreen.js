import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen = () => {
  console.log("HomeScreen rendered");
  return (
    <View style={styles.container}>
      <Text>Salam</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
