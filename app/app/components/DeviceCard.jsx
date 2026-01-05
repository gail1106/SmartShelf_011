import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';

/* ---------- Helpers ---------- */
const formatLastUpdate = (timestamp: number) => {
  if (!timestamp) return 'No data';
  return new Date(timestamp).toLocaleString();
};

const getFloodColor = (level: number) => {
  if (level >= 3) return 'text-red-600';
  if (level === 2) return 'text-orange-500';
  if (level === 1) return 'text-yellow-500';
  return 'text-green-600';
};

/* ---------- Metric Card ---------- */
const MetricCard = ({ title, value, iconName, bgColor, valueColor }) => (
  <View className="w-1/2 p-2">
    <View className={`flex-row items-center p-3 rounded-xl border border-gray-100 ${bgColor}`}>
      <MaterialCommunityIcons name={iconName} size={22} color="#374151" />
      <View className="ml-3">
        <Text className={`text-base font-bold ${valueColor}`}>{value}</Text>
        <Text className="text-xs text-gray-500">{title}</Text>
      </View>
    </View>
  </View>
);

/* ---------- Device Card ---------- */
const DeviceCard = ({ device, pressEventHandler }) => {
  return (
    <TouchableOpacity
      className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-md border border-gray-100 active:bg-gray-50"
      onPress={() => pressEventHandler(device)}
      activeOpacity={0.85}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start pb-3 mb-3 border-b border-gray-100">
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-gray-900">
            {device.deviceID}
          </Text>

          {!!device.location && (
            <Text className="text-xs text-gray-500">
              📍 {device.location}
            </Text>
          )}

          <Text className="text-xs text-gray-400 mt-1">
            Last update: {formatLastUpdate(device.lastUpdate)}
          </Text>
        </View>

        <Octicons
          name="dot-fill"
          size={26}
          color={device.isonline ? 'green' : 'red'}
        />
      </View>

      {/* Weather & Flood Status */}
      <View className="flex-row flex-wrap -m-2">
        <MetricCard
          title="Rain Status"
          value={device.isRaining ? 'Raining' : 'Clear'}
          iconName="weather-rainy"
          bgColor="bg-blue-50"
          valueColor={device.isRaining ? 'text-blue-600' : 'text-green-600'}
        />

        <MetricCard
          title="Rainfall Intensity"
          value={`${device.rainfallIntensity} mm/hr`}
          iconName="weather-pouring"
          bgColor="bg-indigo-50"
          valueColor="text-gray-800"
        />

        <MetricCard
          title="Flood Level"
          value={`Level ${device.floodLevel}`}
          iconName="home-flood"
          bgColor="bg-red-50"
          valueColor={getFloodColor(device.floodLevel)}
        />
      </View>
    </TouchableOpacity>
  );
};

export default DeviceCard;
