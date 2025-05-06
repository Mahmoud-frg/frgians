import { useFonts } from 'expo-font';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import './globals.css';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === '(tabs)';

    console.log('User changed: ', isSignedIn);

    if (isSignedIn && !inTabsGroup) {
      router.replace('/home');
    } else if (!isSignedIn) {
      router.replace('/sign-in');
    }
  }, [isSignedIn]);

  return <Slot />;
};

const RootLayout = () => {
  useFonts({
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
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <InitialLayout />
    </ClerkProvider>
  );
};
export default RootLayout;
