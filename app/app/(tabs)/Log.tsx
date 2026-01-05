import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  Image
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";

import axiosInstance from "@/axiosConfig";
import loadingOverlay from "../components/LoadingOverlay";
import logo from "../../assets/images/logo.png";

/* ---------- TABLE HEADER ---------- */
const renderTableHeading = () => (
  <View className="flex-row w-full py-2 bg-slate-500 rounded-t-lg">
    <Text className="w-24 text-center text-white text-xs font-bold">Date</Text>
    <Text className="flex-1 text-center text-white text-xs font-bold">Rain</Text>
    <Text className="flex-1 text-center text-white text-xs font-bold">
      Rainfall
    </Text>
    <Text className="flex-1 text-center text-white text-xs font-bold">
      Flood
    </Text>
    <Text className="flex-1 text-center text-white text-xs font-bold">
      Location
    </Text>
  </View>
);

/* ---------- TABLE ROW ---------- */
const renderTableData = ({ item }) => {
  if (!item) return null;

  return (
    <View className="flex-row w-full py-2 border-b border-gray-100">
      <Text className="w-24 text-left text-xs pl-2">
        {new Date(item.eventDate).toLocaleDateString()}
      </Text>

      <Text className="flex-1 text-center text-xs">
        {item.isRaining ? "Yes" : "No"}
      </Text>

      <Text className="flex-1 text-center text-xs">
        {item.rainfallIntensity} mm/hr
      </Text>

      <Text
        className={`flex-1 text-center text-xs font-bold ${
          item.floodLevel >= 3
            ? "text-red-600"
            : item.floodLevel === 2
            ? "text-orange-500"
            : item.floodLevel === 1
            ? "text-yellow-500"
            : "text-green-600"
        }`}
      >
        {item.floodLevel}
      </Text>

      <Text className="flex-1 text-center text-xs">
        {item.location || "-"}
      </Text>
    </View>
  );
};

/* ---------- MAIN PAGE ---------- */
const ProfileTab = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [deviceIDs, setDeviceIDs] = useState([]);
  const [selectedDeviceID, setSelectedDeviceID] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [data, setData] = useState([]);

  /* ---------- LOAD DEVICES ---------- */
  const loadDevices = async () => {
    try {
      const response = await axiosInstance.get("/device/get-my-devices", {
        withCredentials: true,
      });

      if (!response.data.success) {
        Toast.show({
          type: "error",
          text1: "❌ Failed to load devices",
          text2: response.data.message,
        });
        return;
      }

      setDeviceIDs(response.data.data.map((d) => d.deviceID));
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "❌ Error loading devices",
        text2: error.message,
      });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadDevices().finally(() => setIsLoading(false));
  }, []);

  /* ---------- SEARCH EVENTS ---------- */
  const searchEvents = async () => {
    setIsLoading(true);
    setData([]);

    try {
      const payload = {
        startDate,
        endDate,
      };

      if (selectedDeviceID) {
        payload.deviceID = selectedDeviceID;
      }

      const response = await axiosInstance.post(
        "/event/sensor-records",
        payload,
        { withCredentials: true }
      );

      if (!response.data.success) {
        Toast.show({
          type: "error",
          text1: "❌ Failed to fetch records",
          text2: response.data.message,
        });
        return;
      }

      setData(response.data.data);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "❌ Server error",
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cyan-800">
      {isLoading && loadingOverlay()}

      {/* Header */}
      <View className="flex-row items-center gap-5 px-5 py-4 bg-slate-800 pt-10">
        <Image source={logo} style={{ width: 50, height: 50 }} />
        <Text className="text-3xl font-extrabold text-white">Logs</Text>
      </View>

      {/* Filters */}
      <View className="px-6 py-4 mx-5 my-5 bg-cyan-200 rounded-lg">
        {/* Device Picker */}
        <View className="flex-row items-center gap-4 mb-3">
          <Text className="font-extrabold">Device:</Text>
          <View className="flex-1 bg-white rounded-xl border border-gray-300">
            <Picker
              selectedValue={selectedDeviceID}
              onValueChange={setSelectedDeviceID}
            >
              <Picker.Item label="All" value="" />
              {deviceIDs.map((id) => (
                <Picker.Item key={id} label={id} value={id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Dates */}
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className="font-bold">Start Date</Text>
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              className="bg-white p-3 rounded-xl border border-gray-300 flex-row justify-between"
            >
              <Text>{startDate.toLocaleDateString()}</Text>
              <MaterialIcons name="arrow-drop-down" size={24} />
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e) => {
                  setStartDate(new Date(e.nativeEvent.timestamp));
                  setShowStartPicker(false);
                }}
              />
            )}
          </View>

          <View className="flex-1">
            <Text className="font-bold">End Date</Text>
            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              className="bg-white p-3 rounded-xl border border-gray-300 flex-row justify-between"
            >
              <Text>{endDate.toLocaleDateString()}</Text>
              <MaterialIcons name="arrow-drop-down" size={24} />
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                minimumDate={startDate}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e) => {
                  setEndDate(new Date(e.nativeEvent.timestamp));
                  setShowEndPicker(false);
                }}
              />
            )}
          </View>
        </View>

        {/* Search Button */}
        <TouchableOpacity
          onPress={searchEvents}
          className="bg-blue-600 mt-4 py-3 rounded-lg"
        >
          <Text className="text-white text-center font-bold">Search</Text>
        </TouchableOpacity>
      </View>

      {/* Table */}
      {data.length > 0 && (
        <View className="mx-2 bg-white rounded-lg overflow-hidden">
          <FlatList
            data={data}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={renderTableHeading}
            renderItem={renderTableData}
            stickyHeaderIndices={[0]}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ProfileTab;
