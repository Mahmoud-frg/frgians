import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import React from 'react';

const LoginScreen = () => {
  return (
    <View>
      <Text>LoginScreen</Text>

      <Link href='/(auth)/sign-in'>
        <Text>Sign in</Text>
      </Link>
      <Link href='/(auth)/sign-up'>
        <Text>Sign up</Text>
      </Link>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({});
