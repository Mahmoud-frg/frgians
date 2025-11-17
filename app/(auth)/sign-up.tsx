import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import * as React from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import Spinner from 'react-native-loading-spinner-overlay';
import { images } from '@/constants/images';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

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

  const isUsernameValid = (username: string) => {
    // Must be 3–50 characters, only letters, numbers, underscores, and hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
    return usernameRegex.test(username);
  };

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Username validation
    if (!isUsernameValid(username)) {
      alert(
        'Username must be 3–50 characters and contain only letters, numbers, underscores, or hyphens.'
      );
      return;
    }

    // Email domain validation
    if (!emailAddress.endsWith('@frg-eg.com')) {
      alert('Please use your official email id (@frg-eg.com) to sign up.');
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // adjust if header exists
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className='flex-1 justify-center bg-primary'>
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
              <View className='mx-auto bg-search rounded-2xl shadow-2xl p-10'>
                <Spinner visible={loading} />

                <View className='mx-auto'>
                  <Text
                    className='mx-auto text-3xl color-coTitle'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    Verify your email
                  </Text>
                  <Image
                    source={images.FRGians}
                    className='w-14 h-14 mt-10 mx-auto'
                    tintColor='#000000'
                  />
                  <Text
                    className='mx-auto text-coTitle'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    FRGians
                  </Text>
                </View>

                <View className='p-10'>
                  <View className='gap-2'>
                    <TextInput
                      className='w-full px-4 py-3 rounded-lg bg-secondary color-darkest border border-dataHolder'
                      style={{ fontFamily: 'outfit-bold' }}
                      value={code}
                      placeholder='Enter your verification code'
                      placeholderTextColor='#1234'
                      onChangeText={(code) => setCode(code)}
                    />
                  </View>

                  <View className='p-7'>
                    <TouchableOpacity
                      onPress={onVerifyPress}
                      className='w-full px-4 py-3 rounded-lg bg-coSecondary'
                    >
                      <Text
                        className='mx-auto text-xl text-darkest'
                        style={{ fontFamily: 'outfit-bold' }}
                      >
                        Verify
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // adjust if header exists
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className='flex-1 justify-center bg-primary'>
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
            <View className='w-96 mx-auto bg-search rounded-2xl shadow-2xl p-10'>
              <Spinner visible={loading} />

              <View className='mx-auto mb-5'>
                <Text
                  className='mx-auto text-3xl color-coTitle'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Sign up
                </Text>
                <Image
                  source={images.FRGians}
                  className='w-14 h-14 mt-10 mx-auto'
                  tintColor='#000000'
                />
                <Text
                  className='mx-auto text-coTitle'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  FRGians
                </Text>
                <Text
                  className='mx-auto mt-5 text-xl color-title'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Join our FRG application
                </Text>
              </View>

              <View className='gap-2'>
                <TextInput
                  className='w-full px-4 py-3 rounded-lg bg-secondary color-darkest border border-dataHolder'
                  style={{ fontFamily: 'outfit-bold' }}
                  value={firstName}
                  placeholder='first name'
                  placeholderTextColor='#1234'
                  onChangeText={(firstName) => setFirstName(firstName)}
                />
                <TextInput
                  className='w-full px-4 py-3 rounded-lg bg-secondary color-darkest border border-dataHolder'
                  style={{ fontFamily: 'outfit-bold' }}
                  value={lastName}
                  placeholder='last name'
                  placeholderTextColor='#1234'
                  onChangeText={(lastName) => setLastName(lastName)}
                />
                <TextInput
                  className='w-full px-4 py-3 rounded-lg bg-secondary color-darkest border border-dataHolder'
                  style={{ fontFamily: 'outfit-bold' }}
                  value={username}
                  placeholder='user name'
                  placeholderTextColor='#1234'
                  onChangeText={(username) => setUsername(username)}
                />
                <TextInput
                  className='w-full px-4 py-3 rounded-lg bg-secondary color-darkest border border-dataHolder'
                  style={{ fontFamily: 'outfit-bold' }}
                  autoCapitalize='none'
                  value={emailAddress}
                  placeholder='email : name.name@frg-eg.com'
                  placeholderTextColor='#1234'
                  onChangeText={(email) => setEmailAddress(email)}
                />
                <TextInput
                  className='w-full px-4 py-3 rounded-lg bg-secondary color-darkest border border-dataHolder'
                  style={{ fontFamily: 'outfit-bold' }}
                  value={password}
                  placeholder='password'
                  placeholderTextColor='#1234'
                  secureTextEntry={true}
                  onChangeText={(password) => setPassword(password)}
                />
              </View>

              <View className='p-7'>
                <TouchableOpacity
                  onPress={onSignUpPress}
                  className='w-full px-4 py-3 rounded-lg bg-coSecondary'
                >
                  <Text
                    className='mx-auto text-xl text-darkest'
                    style={{ fontFamily: 'outfit-bold' }}
                  >
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>

              <View className='flex gab-3'>
                <Text
                  className='mx-auto text-l text-darkest'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Already have an account?
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
