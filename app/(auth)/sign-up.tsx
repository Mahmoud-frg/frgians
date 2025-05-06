import * as React from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import Spinner from 'react-native-loading-spinner-overlay';
import { images } from '@/constants/images';
import { Colors } from '@/constants/Colors';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Email domain validation
    if (!emailAddress.endsWith('@frg-eg.com')) {
      alert('Please use your company email address (@frg-eg.com) to sign up.');
      return;
    }

    setLoading(true); // <--- Start loading if everything is valid

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        firstName,
        lastName,
        username,
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      // console.error(JSON.stringify(err, null, 2));
      alert(err.errors[0].longMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/home');
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
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

  if (pendingVerification) {
    return (
      <View className='flex-1 justify-center'>
        <View className='mx-auto bg-white rounded-lg shadow-2xl p-10'>
          <Spinner visible={loading} />

          <View className='mx-auto'>
            <Text className='mx-auto text-3xl font-bold color-title'>
              Verify your email
            </Text>
            <Image
              source={images.FRGians}
              className='w-14 h-14 mt-10 mx-auto'
            />
            <Text className='mx-auto text-secondary text-base font-extrabold'>
              FRGians
            </Text>
          </View>

          <View className='p-10'>
            <View className='gap-2'>
              <TextInput
                className='w-full px-4 py-3 rounded-lg bg-primary'
                value={code}
                placeholder='Enter your verification code'
                onChangeText={(code) => setCode(code)}
              />
            </View>

            <View className='p-7'>
              <TouchableOpacity
                onPress={onVerifyPress}
                className='w-full px-4 py-3 rounded-lg bg-title'
              >
                <Text className='mx-auto text-xl font-bold text-white'>
                  Verify
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className='flex-1 justify-center'>
      <View className='w-96 mx-auto bg-white rounded-lg shadow-2xl p-10'>
        <Spinner visible={loading} />

        <View className='mx-auto mb-5'>
          <Text className='mx-auto text-3xl font-bold color-title'>
            Sign up
          </Text>
          <Image
            source={images.FRGians}
            className='w-14 h-14 mt-10 mx-auto'
          />
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
              value={firstName}
              placeholder='first name'
              onChangeText={(firstName) => setFirstName(firstName)}
            />
            <TextInput
              className='w-full px-4 py-3 rounded-lg bg-primary'
              value={lastName}
              placeholder='last name'
              onChangeText={(lastName) => setLastName(lastName)}
            />
            <TextInput
              className='w-full px-4 py-3 rounded-lg bg-primary'
              value={username}
              placeholder='user name'
              onChangeText={(username) => setUsername(username)}
            />
            <TextInput
              className='w-full px-4 py-3 rounded-lg bg-primary'
              autoCapitalize='none'
              value={emailAddress}
              placeholder='email : name.name@frg-eg.com'
              onChangeText={(email) => setEmailAddress(email)}
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
              onPress={onSignUpPress}
              className='w-full px-4 py-3 rounded-lg bg-title'
            >
              <Text className='mx-auto text-xl font-bold text-white'>
                Continue
              </Text>
            </TouchableOpacity>
          </View>

          <View className='flex gab-3'>
            <Text className='mx-auto text-l font-bold'>
              Already have an account?
            </Text>
            <Link
              href='/sign-in'
              className='mx-auto'
            >
              <Text className='mx-auto text-2xl font-bold text-title'>
                Sign in
              </Text>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}
