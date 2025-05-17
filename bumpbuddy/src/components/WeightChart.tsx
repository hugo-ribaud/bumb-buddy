import { StyleSheet, Text, View } from "react-native";

import React from "react";
import { WeightLog } from "../services/healthService";

interface WeightChartProps {
  data: WeightLog[];
}

const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  // Display only the most recent 7 entries
  const chartData = [...data].slice(0, 7).reverse();

  if (chartData.length === 0) {
    return null;
  }

  // Find min and max weight values for scaling
  const weights = chartData.map((item) => item.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight;

  // Calculate scaling factor (with padding)
  const padding = range * 0.2;
  const scaledMin = Math.max(0, minWeight - padding);
  const scaledMax = maxWeight + padding;
  const chartHeight = 150;

  const getBarHeight = (weight: number) => {
    if (scaledMax === scaledMin) return chartHeight / 2; // Avoid division by zero
    return ((weight - scaledMin) / (scaledMax - scaledMin)) * chartHeight;
  };

  return (
    <View style={styles.container}>
      <View style={styles.yAxis}>
        <Text style={styles.axisLabel}>{scaledMax.toFixed(1)} kg</Text>
        <Text style={styles.axisLabel}>
          {((scaledMax + scaledMin) / 2).toFixed(1)} kg
        </Text>
        <Text style={styles.axisLabel}>{scaledMin.toFixed(1)} kg</Text>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.horizontalLines}>
          <View style={styles.horizontalLine} />
          <View style={styles.horizontalLine} />
          <View style={styles.horizontalLine} />
        </View>

        <View style={styles.barsContainer}>
          {chartData.map((item, index) => (
            <View key={item.id} style={styles.barWrapper}>
              <View
                style={[styles.bar, { height: getBarHeight(item.weight) }]}
              />
              <Text style={styles.barLabel}>{item.weight}</Text>
              <Text style={styles.dateLabel}>
                {new Date(item.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: 20,
    paddingRight: 10,
    height: 200,
  },
  yAxis: {
    width: 50,
    height: 150,
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  axisLabel: {
    fontSize: 10,
    color: "#6c757d",
    textAlign: "right",
  },
  chartContainer: {
    flex: 1,
    height: 150,
  },
  horizontalLines: {
    position: "absolute",
    width: "100%",
    height: 150,
    justifyContent: "space-between",
  },
  horizontalLine: {
    width: "100%",
    height: 1,
    backgroundColor: "#e9ecef",
  },
  barsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 150,
    paddingTop: 5,
  },
  barWrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: 20,
    backgroundColor: "#007bff",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barLabel: {
    fontSize: 10,
    color: "#343a40",
    marginTop: 5,
  },
  dateLabel: {
    fontSize: 8,
    color: "#6c757d",
    marginTop: 2,
  },
});

export default WeightChart;
