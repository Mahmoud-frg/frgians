import { Redirect, router, Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect } from 'react';

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      // return <Redirect href='/(tabs)/home' />;

      router.replace('/(tabs)/home');
    }
  }, [isSignedIn]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
      }}
    >
      {/* <Stack.Screen
        name='(tabs)'
        options={{
          headerShown: false,
        }}
      /> */}

      <Stack.Screen
        name='sign-in'
        options={{
          headerTitle: 'Clerk Auth App',
        }}
      ></Stack.Screen>
      <Stack.Screen
        name='sign-up'
        options={{
          headerTitle: 'Create Account',
        }}
      ></Stack.Screen>
      <Stack.Screen
        name='pw-reset'
        options={{
          headerTitle: 'Reset Password',
        }}
      ></Stack.Screen>
    </Stack>
  );
}
