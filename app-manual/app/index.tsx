import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import axiosInstance from '../axiosConfig.js';

const screenWidth = Dimensions.get('window').width;

// Sidebar Menu Modal
function MenuModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const menuItems = [
    { icon: 'grid', label: 'Dashboard', active: true },
    { icon: 'phone-portrait', label: 'Devices', active: false },
    { icon: 'warning', label: 'Alerts', active: false },
    { icon: 'chatbubble', label: 'Responses', active: false },
    { icon: 'mail', label: 'Messages', active: false },
    { icon: 'document-text', label: 'Reports', active: false },
    { icon: 'people', label: 'Community Info', active: false },
    { icon: 'settings', label: 'Settings', active: false },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
        <View className="bg-white rounded-t-3xl p-5">
          <View className="w-12 h-1 bg-neutral-300 rounded-full self-center mb-5" />
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-neutral-900">Menu</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color="#171717" />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.7}
                className={`flex-row items-center gap-3 px-3 py-3 rounded-lg mb-1 ${
                  item.active ? 'bg-red-50' : ''
                }`}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={20} 
                  color={item.active ? '#EF4444' : '#525252'} 
                />
                <Text className={item.active ? 'text-red-500 font-semibold' : 'text-neutral-600'}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
            <View className="h-px bg-neutral-200 my-2" />
            <TouchableOpacity className="flex-row items-center gap-3 px-3 py-3 rounded-lg" activeOpacity={0.7}>
              <Ionicons name="log-out" size={20} color="#525252" />
              <Text className="text-neutral-600">Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Main App Component
export default function App() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [ data, setData] = useState([]);

useEffect(()=>{
const func=async()=>{
  try{
    const response = await axiosInstance.get("/device/get");
    if(!response.data.success){
      console.log(JSON.stringify(response.data.message));
      setData([]);
    }else{
      setData(response.data.data[0]);
      console.log(JSON.stringify(response.data.data[0]));
    }
   } catch(error){
      console.error("Data.retrieval error:", error.message);
    
    }
  }

  func();
  const intervalId = setInterval(func, 5000); // Reload every 10 seconds

  return () => clearInterval(intervalId);
},[]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#EF4444" />
      
      <View className="flex-1">
        {/* Header with Alert */}
        <View className="bg-red-500">
          <View className="px-4 py-3 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
              <Ionicons name="menu" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-row items-center gap-2">
              <Ionicons name="warning" size={18} color="white" />
              <Text className="text-white font-bold">SafeAlert</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View className="px-4 pb-3">
            <Text className="text-white text-lg">Data monitoring from device: {data.deviceID}</Text>
          </View>
        </View>
        <ScrollView className="flex-1 bg-neutral-50" showsVerticalScrollIndicator={false}>
          {/* Alert Summary Cards */}
          <View className="flex flex-row w-auto h-fit mx-5 my-3 py-5 bg-white border items-center justify-center gap-2 rounded-lg">
            <Text>Device Status: </Text>{data.isonline ? (<Feather name="check-circle" size={24} color="green" />):(<Feather name="minus-circle" size={24} color="red" />)}
          </View>
          <View className="px-4 py-4">
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
                <View className="flex-row items-center gap-2 mb-2">
                  <View className="w-8 h-8 bg-blue-400 rounded-lg items-center justify-center">
                    <Ionicons name="water" size={16} color="white" />
                  </View>
                  <Text className="text-xs text-neutral-500">Water Level</Text>
                </View>
                {
                  data.floodLevel === 0 ? (
                    <Text className="text-xs text-green-500 font-semibold mt-1">
                      Safe
                    </Text>    
                  ) : data.floodLevel === 1 ? (
                    <Text className="text-xs text-blue-500 font-semibold mt-1">
                      Flood Cautious
                    </Text>
                  ) : (
                    <Text className="text-xs text-red-500 font-semibold mt-1">
                      Critical
                    </Text>
                  )
                }
                
              </View>

              <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
                <View className="flex-row items-center gap-2 mb-2">
                  <View className="w-8 h-8 bg-yellow-500 rounded-lg items-center justify-center">
                    <Ionicons name="rainy" size={16} color="white" />
                  </View>
                  <Text className="text-xs text-neutral-500">Rainfall</Text>
                </View>
                <Text className="text-2xl font-bold text-neutral-900">{data.rainfallIntensity}</Text>
                <Text className="text-xs text-neutral-500 mt-1">mm/hr</Text>
              </View>
            </View>

            {/* Quick Stats */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-white rounded-xl p-3 shadow-sm">
                <Text className="text-xs text-neutral-500 mb-1">Is it Raining?</Text>
                {data.isRaining ? (
                  <Text className="text-sm font-bold text-neutral-900">Yes</Text>
                  ):(
                    <Text className="text-sm font-semibold text-neutral-900">No</Text>
                  )}
              </View>
              <View className="flex-1 bg-white rounded-xl p-3 shadow-sm">
                <Text className="text-xs text-neutral-500 mb-1">Location</Text>
                <Text className="text-sm font-semibold text-neutral-900">Barangay 3</Text>
              </View>
            </View>
          </View>

          {/* Evacuation Warning */}
          <View className="px-4 pb-4">
            <View className="bg-red-500 rounded-xl p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                  <Ionicons name="warning" size={24} color="white" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">EVACUATE NOW</Text>
                  <Text className="text-white/90 text-xs">Immediate action required</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </View>
          </View>

          {/* Map Section */}
          <View className="px-4 pb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-bold text-neutral-900">Affected Area</Text>
              <TouchableOpacity className="flex-row items-center gap-1" activeOpacity={0.7}>
                <Text className="text-xs text-red-500 font-semibold">View Full Map</Text>
                <Ionicons name="chevron-forward" size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>
            
            <View className="bg-white rounded-xl overflow-hidden shadow-sm">
              <View className="bg-neutral-100 h-48 items-center justify-center relative overflow-hidden">
                <View className="absolute right-0 top-0 bottom-0 w-1/2 bg-blue-200" />
                <View className="absolute left-0 top-0 bottom-0 w-1/2 bg-orange-300 opacity-70" />
                
                <View className="absolute">
                  <View className="w-12 h-12 bg-red-500 rounded-full items-center justify-center shadow-lg">
                    <Ionicons name="warning" size={28} color="white" />
                  </View>
                </View>

                <View className="absolute top-2 left-2 gap-1">
                  <TouchableOpacity className="w-8 h-8 bg-white rounded-lg shadow items-center justify-center" activeOpacity={0.7}>
                    <Ionicons name="add" size={16} color="#171717" />
                  </TouchableOpacity>
                  <TouchableOpacity className="w-8 h-8 bg-white rounded-lg shadow items-center justify-center" activeOpacity={0.7}>
                    <Ionicons name="remove" size={16} color="#171717" />
                  </TouchableOpacity>
                </View>

                <View className="absolute bottom-2 right-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <Text className="text-xs font-semibold text-neutral-900">Barangay 3</Text>
                </View>
              </View>
            </View>
          </View>

        </ScrollView>

        <MenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
      </View>
    </SafeAreaView>
  );
}
