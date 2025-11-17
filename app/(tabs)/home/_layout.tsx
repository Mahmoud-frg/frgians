// app/(tabs)/home/_layout.tsx
import { Stack } from 'expo-router';

export default function HomeStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        fullScreenGestureEnabled: true, // iOS swipe from anywhere
        animation: 'slide_from_right',
      }}
    />
  );
}
