import { Text, View } from "react-native";

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
    <View className="flex-row mt-5 pr-2.5 h-50">
      <View className="w-[50px] h-[150px] justify-between py-1.5">
        <Text className="text-xs text-right text-gray-500">
          {scaledMax.toFixed(1)} kg
        </Text>
        <Text className="text-xs text-right text-gray-500">
          {((scaledMax + scaledMin) / 2).toFixed(1)} kg
        </Text>
        <Text className="text-xs text-right text-gray-500">
          {scaledMin.toFixed(1)} kg
        </Text>
      </View>

      <View className="flex-1 h-[150px]">
        <View className="absolute w-full h-[150px] justify-between">
          <View className="w-full h-[1px] bg-gray-200" />
          <View className="w-full h-[1px] bg-gray-200" />
          <View className="w-full h-[1px] bg-gray-200" />
        </View>

        <View className="flex-row justify-around items-end h-[150px] pt-1.5">
          {chartData.map((item) => (
            <View key={item.id} className="items-center justify-end">
              <View
                className="w-5 bg-purple-500 rounded-t-sm"
                style={{ height: getBarHeight(item.weight) }}
              />
              <Text className="text-xs text-gray-800 mt-1.5">
                {item.weight}
              </Text>
              <Text className="text-[8px] text-gray-500 mt-0.5">
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

export default WeightChart;
