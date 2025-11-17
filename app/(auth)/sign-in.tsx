import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useState } from 'react';
import Spinner from 'react-native-loading-spinner-overlay';
import { images } from '@/constants/images';
import TiledBackground from '@/components/Auth/TiledBackground';
import { LinearGradient } from 'expo-linear-gradient';

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [cardSize, setCardSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

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
        router.replace({ pathname: '/home', params: { loading: 'true' } });
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
          {/* <View className='w-96 mx-auto bg-darkest rounded-2xl shadow-2xl p-10'> */}
          {/* <ImageBackground
        source={images.darkBG2} // or use <BackgroundSvg /> for SVG
        className='w-96 mx-auto rounded-2xl shadow-2xl p-10 overflow-hidden bg-iconBG'
        // resizeMode='repeat'
        tintColor='#000000'
      > */}
          {/* <View
        className='w-96 mx-auto rounded-2xl shadow-2xl overflow-hidden bg-iconBG p-10'
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setCardSize({ width, height });
        }}
      >
        {cardSize && (
          <TiledBackground
            width={cardSize.width}
            height={cardSize.height}
          />
        )} */}

          {/* Centered overlay image */}
          <Image
            source={images.FRGians}
            tintColor='#FFFFFF'
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 400, // your preferred size
              height: 400,
              opacity: 0.15,
              transform: [
                { translateX: -150 }, // half of width
                { translateY: -200 }, // half of height
              ],
            }}
            resizeMode='cover'
          />
          <Spinner visible={loading} />

          <View className='mx-auto mb-5'>
            <Text
              className='mx-auto text-3xl color-coTitle'
              style={{ fontFamily: 'outfit-bold' }}
            >
              Sign in
            </Text>
            <Image
              source={images.logo}
              className='w-[203px] h-[75px] mt-10 mx-auto'
              tintColor='#FFFFFF'
            />
            <Text
              className='mx-auto mt-5 text-xl text-leaderTitle'
              style={{ fontFamily: 'outfit-semi-bold' }}
            >
              Join our FRG application
            </Text>
            <Text
              className='mx-auto text-coTitle text-base'
              style={{ fontFamily: 'outfit-bold' }}
            >
              FRGians
            </Text>
          </View>

          <View className=''>
            <View className='gap-2'>
              <TextInput
                className='w-full px-4 py-3 rounded-lg bg-secondary color-darkest border border-dataHolder'
                style={{ fontFamily: 'outfit-regular' }}
                autoCapitalize='none'
                value={emailAddress}
                placeholder='email'
                placeholderTextColor='#1234'
                onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
              />
              <TextInput
                className='w-full px-4 py-3 rounded-lg bg-secondary color-darkest border border-dataHolder'
                style={{ fontFamily: 'outfit-regular' }}
                value={password}
                placeholder='password'
                placeholderTextColor='#1234'
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
              />
            </View>

            <View className='p-7'>
              <TouchableOpacity
                onPress={onSignInPress}
                className='w-full px-4 py-3 rounded-lg bg-coSecondary'
              >
                <Text
                  className='mx-auto text-xl text-darkest'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Log in
                </Text>
              </TouchableOpacity>
            </View>

            <View className='flex mx-auto mb-5'>
              <Text
                className='mx-auto text-l text-leaderTitle'
                style={{ fontFamily: 'outfit-bold' }}
              >
                Forgot your password!
              </Text>
              <Link
                href='/pw-reset'
                className='mx-auto'
              >
                <Text
                  className='mx-auto text-2xl  text-coSecondary'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Reset password
                </Text>
              </Link>
            </View>

            <View className='flex mx-auto'>
              <Text
                className='mx-auto text-l  color-leaderTitle'
                style={{ fontFamily: 'outfit-bold' }}
              >
                Don't have an account?
              </Text>
              <Link
                href='/sign-up'
                className='mx-auto'
              >
                <Text
                  className='mx-auto text-2xl  text-coSecondary'
                  style={{ fontFamily: 'outfit-bold' }}
                >
                  Sign up
                </Text>
              </Link>
            </View>
          </View>
          {/* </View> */}
          {/* </ImageBackground> */}
          {/* </View> */}
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
