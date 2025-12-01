import {
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter, Stack } from 'expo-router';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Spinner from 'react-native-loading-spinner-overlay';
import { images } from '@/constants/images';
import { LinearGradient } from 'expo-linear-gradient';

export default function PwReset() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [successfulCreation, setSuccessfulCreation] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Handle the submission of the reset form

  // Request a passowrd reset code by email
  const onRequestReset = async () => {
    if (!isLoaded) return;

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress,
      });

      setSuccessfulCreation(true);
    } catch (err: any) {
      alert(err.errors[0].message);
    }
  };

  // Reset the password with the code and the new password
  const onReset = async () => {
    if (!isLoaded) return;
    // Start the reset process using the email provided
    try {
      const resetAttempt = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });
      console.log(resetAttempt);
      alert('Password reset successfully');

      // If reset process is complete, set the created session as active
      // and redirect the user
      if (resetAttempt.status === 'complete') {
        await setActive({ session: resetAttempt.createdSessionId });
        router.replace('/home');
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(resetAttempt, null, 2));
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      // console.error(JSON.stringify(err, null, 2));
      alert(err.errors[0].longMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <LinearGradient
            colors={[
              '#001920', // deep navy black (bottom base)
              '#00181f', // dark desaturated blue
              '#093341', // mid-indigo layer
              '#1E4451', // soft vibrant blue
              '#2B505D', // light glow blue (top-right)
            ]}
            locations={[0, 0.25, 0.5, 0.75, 1]} // smooth transitions
            start={{ x: 0, y: 1 }} // bottom left
            end={{ x: 1, y: 0 }} // top right
            style={{ flex: 1, justifyContent: 'center', padding: 40 }}
          >
            <Stack.Screen
              options={{ headerBackVisible: !successfulCreation }}
            />

            <View className='w-96 mx-auto bg-search rounded-2xl shadow-2xl p-10'>
              <Spinner visible={loading} />

              <View className='mx-auto mb-5'>
                <Text
                  className='mx-auto text-3xl color-coTitle'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Reset your password
                </Text>
                <Image
                  source={images.FRGians}
                  className='w-14 h-14 mt-10 mx-auto'
                  tintColor='#000000'
                />
                <Text
                  className='mx-auto text-coTitle text-base'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  FRGians
                </Text>
              </View>

              {!successfulCreation && (
                <>
                  <View className='gap-2'>
                    <TextInput
                      className='w-full px-4 py-3 rounded-lg bg-secondary color-darkest border border-dataHolder'
                      style={{ fontFamily: 'outfit-bold' }}
                      autoCapitalize='none'
                      value={emailAddress}
                      placeholder='email'
                      placeholderTextColor='#1234'
                      onChangeText={(emailAddress) =>
                        setEmailAddress(emailAddress)
                      }
                    />
                  </View>

                  <View className='p-7'>
                    <TouchableOpacity
                      onPress={onRequestReset}
                      className='w-full px-4 py-3 rounded-lg bg-coSecondary'
                    >
                      <Text
                        className='mx-auto text-xl text-darkest'
                        style={{ fontFamily: 'outfit-bold' }}
                      >
                        Send Reset Email
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {successfulCreation && (
                <>
                  <View className='gap-2'>
                    <TextInput
                      className='w-full px-4 py-3 rounded-lg bg-secondary color-darkest border border-dataHolder'
                      style={{ fontFamily: 'outfit-bold' }}
                      value={code}
                      placeholder='Reset password code...'
                      placeholderTextColor='#1234'
                      onChangeText={(code) => setCode(code)}
                    />
                    <TextInput
                      className='w-full px-4 py-3 rounded-lg bg-secondary color-darkest border border-dataHolder'
                      style={{ fontFamily: 'outfit-bold' }}
                      value={password}
                      placeholder='new password'
                      placeholderTextColor='#1234'
                      secureTextEntry={true}
                      onChangeText={(password) => setPassword(password)}
                    />
                  </View>

                  <View className='p-7'>
                    <TouchableOpacity
                      onPress={onReset}
                      className='w-full px-4 py-3 rounded-lg bg-coSecondary'
                    >
                      <Text
                        className='mx-auto text-xl text-darkest'
                        style={{ fontFamily: 'outfit-bold' }}
                      >
                        Set new Password
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <View className='flex mx-auto'>
                <Text
                  className='mx-auto text-l color-darkest'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Remember your password!
                </Text>
                <Link
                  href='/sign-in'
                  className='mx-auto'
                >
                  <Text
                    className='mx-auto text-2xl text-coSecondary'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    Sign in
                  </Text>
                </Link>
              </View>
            </View>
          </LinearGradient>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
