import { BackHandler, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import React, {useState, useEffect, useCallback} from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LineChart } from "react-native-chart-kit";
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import axiosInstance from '../../axiosConfig.js';
import loadingOverlay from "../components/LoadingOverlay";
import logo from "../../assets/images/logo.png";



const IrrigationDashboard = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(0);

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    setIsLoading(true);
    const func = async () => {
      try {
        const response = await axiosInstance.get(
          "/event/temp-summary",
          { withCredentials: true }
        );
        if (!response.data.success) {
          setData([]);
        } else {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Data retrieval error:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    func();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true
      );
      return () => subscription.remove();
    }, [])
  );

  /* ---------- SAMPLE SENSOR DATA (replace with API later) ---------- */
  const rainValue = 42; // mm/hr
  const waterLevel = 58; // cm
  const barometer = 1002; // hPa

  const rainStatus =
    rainValue > 60 ? "HEAVY" : rainValue > 30 ? "MODERATE" : "LIGHT";

  const waterStatus =
    waterLevel > 70 ? "CRITICAL" : waterLevel > 50 ? "WARNING" : "NORMAL";

  return (
    <SafeAreaView className="flex-1 w-full bg-cyan-400">
      {isLoading && loadingOverlay()}

      {/* HEADER */}
      <View className="flex flex-row items-center gap-5 px-5 py-4 bg-slate-800 border-b border-gray-100 pt-10">
        <Image source={logo} style={{ width: 50, height: 50 }} />
        <Text className="text-3xl font-extrabold text-white">Home</Text>
      </View>

      {/* DASHBOARD CONTENT */}
      <View
        className="flex flex-col py-5 mx-5 my-5 bg-white shadow-sm border-b border-gray-100 rounded-lg"
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        <View className="w-full mb-5 px-5">
          <Text className="text-gray-700 text-2xl font-bold">
            Sensor Overview
          </Text>
        </View>

        {/* SENSOR CARDS */}
        <View className="flex flex-row flex-wrap justify-between px-5 gap-4">
          {/* RAIN SENSOR */}
          <View className="w-[48%] bg-sky-50 rounded-lg p-4">
            <MaterialCommunityIcons
              name="weather-rainy"
              size={38}
              color="#0284c7"
            />
            <Text className="text-gray-600 mt-2">Rain Sensor</Text>
            <Text
              className={`text-xl font-bold ${
                rainStatus === "HEAVY"
                  ? "text-red-600"
                  : rainStatus === "MODERATE"
                  ? "text-yellow-500"
                  : "text-green-600"
              }`}
            >
              {rainValue} mm/hr
            </Text>
            <Text className="text-sm text-gray-500">{rainStatus}</Text>
          </View>

          {/* WATER SENSOR */}
          <View className="w-[48%] bg-blue-50 rounded-lg p-4">
            <MaterialCommunityIcons
              name="flood"
              size={38}
              color="#2563eb"
            />
            <Text className="text-gray-600 mt-2">Water Level</Text>
            <Text
              className={`text-xl font-bold ${
                waterStatus === "CRITICAL"
                  ? "text-red-600"
                  : waterStatus === "WARNING"
                  ? "text-yellow-500"
                  : "text-green-600"
              }`}
            >
              {waterLevel} cm
            </Text>
            <Text className="text-sm text-gray-500">{waterStatus}</Text>
          </View>

          {/* BAROMETER */}
          <View className="w-full bg-slate-50 rounded-lg p-4">
            <MaterialCommunityIcons
              name="gauge"
              size={38}
              color="#0f172a"
            />
            <Text className="text-gray-600 mt-2">Barometer</Text>
            <Text className="text-xl font-bold text-gray-800">
              {barometer} hPa
            </Text>
            <Text className="text-sm text-gray-500">
              {barometer < 1000 ? "Low Pressure (Storm Risk)" : "Stable Pressure"}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default IrrigationDashboard;
