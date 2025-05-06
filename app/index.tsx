import { ClerkProvider, SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import LoginScreen from '@/components/LoginScreen';
import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function Index() {
  // return <Redirect href={'/home'} />;
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator
        size='large'
        color={Colors.primary}
      />
    </View>
  );
}
