// ComparisonChart.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

// Configuration de la largeur de l'écran pour le graphique
const screenWidth = Dimensions.get('window').width;

// Données simulées pour les températures maximales (5 jours)
const simulatedData = {
  fes: [18, 20, 17, 22, 19], // Températures maximales pour Fès
  rabat: [16, 19, 15, 20, 18], // Températures maximales pour Rabat
  labels: ['13/03', '14/03', '15/03', '16/03', '17/03'], // Dates
};

const ComparisonChart = () => {
  const [city1, setCity1] = useState('Fès');
  const [city2, setCity2] = useState('Rabat');
  const [chartData, setChartData] = useState(null);

  const handleCompare = () => {
    // Simuler la récupération des données (remplacez ceci par une requête API si nécessaire)
    const data = {
      labels: simulatedData.labels,
      datasets: [
        {
          data: simulatedData.fes,
          color: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`, // Cyan clair pour Fès
        },
        {
          data: simulatedData.rabat,
          color: (opacity = 1) => `rgba(186, 135, 252, ${opacity})`, // Violet clair pour Rabat
        },
      ],
      legend: [`${city1} - Température maximale (°C)`, `${city2} - Température maximale (°C)`],
    };
    setChartData(data);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Entrées pour les villes */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ville 1"
          value={city1}
          onChangeText={setCity1}
        />
        <TextInput
          style={styles.input}
          placeholder="Ville 2"
          value={city2}
          onChangeText={setCity2}
        />
      </View>

      {/* Bouton Comparer */}
      <TouchableOpacity style={styles.compareButton} onPress={handleCompare}>
        <Text style={styles.compareButtonText}>COMPARER</Text>
      </TouchableOpacity>

      {/* Graphique */}
      {chartData ? (
        <>
          <Text style={styles.chartTitle}>Comparaison des températures maximales sur 5 jours</Text>
          <BarChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix="°C"
            chartConfig={{
              backgroundColor: '#1a1a1a',
              backgroundGradientFrom: '#1a1a1a',
              backgroundGradientTo: '#1a1a1a',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForBars: {
                strokeWidth: 2,
                stroke: '#fff',
              },
            }}
            style={styles.chart}
          />
        </>
      ) : (
        <Text style={styles.noDataText}>Entrez les villes et cliquez sur Comparer</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    color: '#000',
  },
  compareButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  compareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ComparisonChart;