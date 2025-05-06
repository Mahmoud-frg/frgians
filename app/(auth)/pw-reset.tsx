import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter, Stack } from 'expo-router';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Spinner from 'react-native-loading-spinner-overlay';
import { images } from '@/constants/images';

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
    <View className='flex-1 justify-center'>
      <Stack.Screen options={{ headerBackVisible: !successfulCreation }} />

      <View className='w-96 mx-auto bg-white rounded-lg shadow-2xl p-10'>
        <Spinner visible={loading} />

        <View className='mx-auto mb-5'>
          <Text className='mx-auto text-3xl font-bold color-title'>
            Reset your password
          </Text>
          <Image source={images.FRGians} className='w-14 h-14 mt-10 mx-auto' />
          <Text className='mx-auto text-secondary text-base font-extrabold'>
            FRGians
          </Text>
        </View>

        {!successfulCreation && (
          <>
            <View className='gap-2'>
              <TextInput
                className='w-full px-4 py-3 rounded-lg bg-primary'
                autoCapitalize='none'
                value={emailAddress}
                placeholder='email'
                onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
              />
            </View>

            <View className='p-7'>
              <TouchableOpacity
                onPress={onRequestReset}
                className='w-full px-4 py-3 rounded-lg bg-title'
              >
                <Text className='mx-auto text-xl font-bold text-white'>
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
                className='w-full px-4 py-3 rounded-lg bg-primary'
                value={code}
                placeholder='Reset password code...'
                onChangeText={(code) => setCode(code)}
              />
              <TextInput
                className='w-full px-4 py-3 rounded-lg bg-primary'
                value={password}
                placeholder='new password'
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
              />
            </View>

            <View className='p-7'>
              <TouchableOpacity
                onPress={onReset}
                className='w-full px-4 py-3 rounded-lg bg-title'
              >
                <Text className='mx-auto text-xl font-bold text-white'>
                  Set new Password
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View className='flex mx-auto'>
          <Text className='mx-auto text-l font-bold'>
            Remember your password!
          </Text>
          <Link href='/sign-in' className='mx-auto'>
            <Text className='mx-auto text-2xl font-bold text-title'>
              Sign in
            </Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
