import { View } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBar } from '@react-navigation/bottom-tabs';

// 👇 Shared controller that screens can access
interface TabVisibilityController {
  value: number;
  setVisible?: (show: boolean) => void;
}

export const tabVisibility: TabVisibilityController = { value: 1 }; // Export shared scroll direction for screens to modify

const TabLayout = () => {
  const visible = useSharedValue(1); // 1 = visible, 0 = hidden

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(visible.value ? 0 : 100, { duration: 250 }),
      },
    ],
    opacity: withTiming(visible.value ? 1 : 0, { duration: 250 }),
  }));

  // 👇 expose function to toggle visibility from any screen
  tabVisibility.setVisible = (show: boolean) => {
    visible.value = show ? 1 : 0;
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.coSecondary,
          tabBarInactiveTintColor: Colors.dark.text,
          tabBarStyle: {
            position: 'absolute', // ensures it floats, prevents background bleed
            backgroundColor: Colors.dark.statusbar, // your actual background color
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
            height: 55,
            paddingBottom: 3,
            paddingTop: 3,
            borderTopWidth: 0,
            elevation: 0,
          },

          tabBarBackground: () => (
            // <View
            //   style={{
            //     backgroundColor: 'white',
            //     opacity: 0.25,
            //     flex: 1,
            //     borderTopLeftRadius: 50,
            //     borderTopRightRadius: 50,
            //   }}
            // />

            <LinearGradient
              colors={['#2B505D', '#1E4451', '#093341', '#00181f', '#001920']}
              locations={[0, 0.25, 0.5, 0.75, 1]} // smooth transitions
              start={{ x: 0, y: 1 }} // bottom left
              end={{ x: 1, y: 0 }} // top right
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                borderTopLeftRadius: 50,
                borderTopRightRadius: 50,
              }}
            />
            // <ImageBackground
            //   source={images.darkBG3} // or use <BackgroundSvg /> for SVG
            //   className='overflow-hidden bg-iconBG'
            //   // resizeMode='repeat'
            //   tintColor='#000000'
            //   style={{
            //     flex: 1,
            //     borderTopLeftRadius: 50,
            //     borderTopRightRadius: 50,
            //   }}
            // />
          ),
        }}
        // 👇 Override the whole tab bar with animation
        tabBar={(props) => (
          <Animated.View style={[animatedStyle]}>
            <BottomTabBar {...props} />
          </Animated.View>
        )}
      >
        <Tabs.Screen
          name='home'
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        ></Tabs.Screen>
        <Tabs.Screen
          name='search'
          options={{
            tabBarLabel: 'Search',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'search' : 'search-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        ></Tabs.Screen>
        <Tabs.Screen
          name='profile'
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'person-circle' : 'person-circle-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        ></Tabs.Screen>
      </Tabs>
    </View>
  );
};
export default TabLayout;
