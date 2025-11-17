import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '@/constants/Colors';

SplashScreen.preventAutoHideAsync(); // Keep native splash showing until ready

type Props = {
  onFinish: () => void;
};

const AppLoadingScreen = ({ onFinish }: Props) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Simulate loading assets, fonts, or fetching data
        await Promise.all([
          // Example: Load fonts or assets
          // await Font.loadAsync({ 'CustomFont': require('./assets/fonts/CustomFont.ttf') }),

          // Simulate fetching data (e.g., from Firestore)
          await new Promise((resolve) => setTimeout(resolve, 3000)),

          // Example: Fetch data from Firestore (uncomment this if needed)
          // await firestore.collection('news').get(),
        ]);
        setIsReady(true); // Mark as ready when all async tasks are done
      } catch (error) {
        console.error('Error loading resources', error);
      } finally {
        await SplashScreen.hideAsync(); // Hide splash screen once everything is ready
        onFinish(); // Proceed to the next screen
      }
    };

    load();
  }, [onFinish]);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/splash.png')}
          style={styles.image}
          resizeMode='contain'
        />
        <Text style={styles.text}>...Loading...</Text>
        <ActivityIndicator
          size='large'
          // color={Colors.coSecondary}
          color={Colors.coSecondary}
          style={styles.spinner}
        />
      </View>
    );
  }

  return null; // Or render the main app screen after loading is finished
};

export default AppLoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  text: {
    fontFamily: 'outfit-bold',
    fontSize: 20,
    fontWeight: '600',
    color: '#444444',
  },
  spinner: {
    marginTop: 10,
  },
});
