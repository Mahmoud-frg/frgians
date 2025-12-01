import { useFonts } from 'expo-font';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import './globals.css';
import AppLoadingScreen from '@/components/LoadingScreen/AppLoadingScreen';
import * as SplashScreen from 'expo-splash-screen';
import { NotificationProvider } from '@/context/NotificationContext';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Colors } from '@/constants/Colors';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Set notification handler once
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Clerk publishable key
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

const InitialLayout = ({ fontsLoaded }: { fontsLoaded: boolean }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const ready = isLoaded && fontsLoaded;

  // ⛔ Wait for Clerk to load before navigating
  useEffect(() => {
    if (!isLoaded || isSignedIn === undefined || !fontsLoaded) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (isSignedIn && !inTabsGroup) {
      router.replace('/home');
    } else if (!isSignedIn) {
      router.replace('/sign-in');
    }
  }, [isLoaded, isSignedIn, fontsLoaded]);

  // ✅ Hide splash screen when ready
  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  // 🔁 Still loading
  if (!ready) {
    return <AppLoadingScreen onFinish={() => {}} />;
  }

  return <Slot />;
};

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    'outfit-light': require('@/assets/fonts/Outfit-Light.ttf'),
    'outfit-extra-light': require('@/assets/fonts/Outfit-ExtraLight.ttf'),
    'outfit-black': require('@/assets/fonts/Outfit-Black.ttf'),
    'outfit-regular': require('@/assets/fonts/Outfit-Regular.ttf'),
    'outfit-medium': require('@/assets/fonts/Outfit-Medium.ttf'),
    'outfit-bold': require('@/assets/fonts/Outfit-Bold.ttf'),
    'outfit-semi-bold': require('@/assets/fonts/Outfit-SemiBold.ttf'),
    'outfit-extra-bold': require('@/assets/fonts/Outfit-ExtraBold.ttf'),
    'outfit-thin': require('@/assets/fonts/Outfit-Thin.ttf'),
  });

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(Colors.dark.statusbar);
    NavigationBar.setButtonStyleAsync('light');
  }, []);

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <NotificationProvider>
        <StatusBar
          style='light'
          backgroundColor={Colors.dark.statusbar}
          translucent={false}
        />
        <SafeAreaProvider>
          <SafeAreaView
            style={{ flex: 1, backgroundColor: Colors.dark.statusbar }}
            edges={['top']}
          >
            <InitialLayout fontsLoaded={fontsLoaded} />
            <Toast />
          </SafeAreaView>
        </SafeAreaProvider>
      </NotificationProvider>
    </ClerkProvider>
  );
};

export default RootLayout;
