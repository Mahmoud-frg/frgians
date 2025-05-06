import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Spinner from 'react-native-loading-spinner-overlay';
import { images } from '@/constants/images';

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/home');
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      // console.error(JSON.stringify(err, null, 2));
      alert(err.errors[0].message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='flex-1 justify-center'>
      <View className='w-96 mx-auto bg-white rounded-lg shadow-2xl p-10'>
        <Spinner visible={loading} />

        <View className='mx-auto mb-5'>
          <Text className='mx-auto text-3xl font-bold color-title'>
            Sign in
          </Text>
          <Image source={images.FRGians} className='w-14 h-14 mt-10 mx-auto' />
          <Text className='mx-auto text-secondary text-base font-extrabold'>
            FRGians
          </Text>
          <Text className='mx-auto mt-5 text-xl font-bold'>
            Join our FRG application
          </Text>
        </View>

        <View className=''>
          <View className='gap-2'>
            <TextInput
              className='w-full px-4 py-3 rounded-lg bg-primary'
              autoCapitalize='none'
              value={emailAddress}
              placeholder='email'
              onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
            />
            <TextInput
              className='w-full px-4 py-3 rounded-lg bg-primary'
              value={password}
              placeholder='password'
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
            />
          </View>

          <View className='p-7'>
            <TouchableOpacity
              onPress={onSignInPress}
              className='w-full px-4 py-3 rounded-lg bg-title'
            >
              <Text className='mx-auto text-xl font-bold text-white'>
                Log in
              </Text>
            </TouchableOpacity>
          </View>

          <View className='flex mx-auto mb-5'>
            <Text className='mx-auto text-l font-bold'>
              Forget your password!
            </Text>
            <Link href='/pw-reset' className='mx-auto'>
              <Text className='mx-auto text-2xl font-bold text-title'>
                Reset password
              </Text>
            </Link>
          </View>

          <View className='flex mx-auto'>
            <Text className='mx-auto text-l font-bold'>
              Don't have an account?
            </Text>
            <Link href='/sign-up' className='mx-auto'>
              <Text className='mx-auto text-2xl font-bold text-title'>
                Sign up
              </Text>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}
