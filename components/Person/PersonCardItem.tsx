import {
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import React, { useEffect, useRef } from 'react';
import { images } from '@/constants/images';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PersonCardItemProps = {
  onPersonPress: (code: number, name: string) => void;
  person: personsListType;
};

const PersonCardItem = ({ onPersonPress, person }: PersonCardItemProps) => {
  const { code, imageUrl, name } = person;

  // // New Card 1
  // const dotPosition = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   Animated.loop(
  //     Animated.timing(dotPosition, {
  //       toValue: 1,
  //       duration: 6000,
  //       easing: Easing.linear,
  //       useNativeDriver: false,
  //     })
  //   ).start();
  // }, []);

  // const top = dotPosition.interpolate({
  //   inputRange: [0, 0.25, 0.5, 0.75, 1],
  //   outputRange: ['10%', '10%', '90%', '90%', '10%'],
  // });

  // const right = dotPosition.interpolate({
  //   inputRange: [0, 0.25, 0.5, 0.75, 1],
  //   outputRange: ['10%', '90%', '90%', '10%', '10%'],
  // });

  // New Card 2
  const rotateAnim1 = useRef(new Animated.Value(0)).current;
  // const rotateAnim2 = useRef(new Animated.Value(0)).current;
  // const rotateAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createLoop = (anim: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        })
      );
    };

    createLoop(rotateAnim1, 10000).start();
    // createLoop(rotateAnim2, 12000).start();
    // createLoop(rotateAnim3, 10000).start();
  }, []);

  const spin = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

  return (
    // // Old Card
    // <TouchableOpacity
    //   onPress={() => onPersonPress(code, name)}
    //   activeOpacity={0.7}
    // >
    //   <View
    //     className='w-52 h-72 ml-2 mr-2 mb-5 p-2 bg-[#000000] rounded-xl'
    //     style={styles.shadow}
    //   >
    //     <Image
    //       source={
    //         person?.imageUrl === ''
    //           ? images.FRGwhite
    //           : { uri: person?.imageUrl }
    //       }
    //       className='w-32 h-32 mt-5 self-center rounded-full'
    //     />
    //     <View className='mt-2'>
    //       <Text
    //         className='text-xl mt-1 text-center text-white'
    //         style={{ fontFamily: 'outfit-bold' }}
    //       >
    //         {person?.name}
    //       </Text>
    //       <Text
    //         className='text-sm text-center color-slate-600'
    //         style={{ fontFamily: 'outfit-regular' }}
    //       >
    //         {person?.title}
    //       </Text>
    //     </View>
    //   </View>
    // </TouchableOpacity>

    // // New Card 1
    // <TouchableOpacity
    //   onPress={() => onPersonPress(code, name)}
    //   activeOpacity={0.7}
    // >
    //   <View
    //     style={styles.wrapper}
    //     className='w-52 h-72 ml-2 mr-2 mb-5 p-2 bg-[#021526] rounded-xl'
    //   >
    //     <Animated.View style={[styles.dot, { top, right }]} />

    //     <View style={styles.card}>
    //       <View style={styles.ray} />

    //       <View style={[styles.line, styles.topl]} />
    //       <View style={[styles.line, styles.leftl]} />
    //       <View style={[styles.line, styles.bottoml]} />
    //       <View style={[styles.line, styles.rightl]} />

    //       <Image
    //         source={
    //           person?.imageUrl === ''
    //             ? images.FRGwhite
    //             : { uri: person?.imageUrl }
    //         }
    //         className='w-32 h-32 mt-5 self-center rounded-full'
    //       />
    //       <View className='mt-2'>
    //         <Text
    //           className='text-xl mt-1 text-center text-white'
    //           style={{ fontFamily: 'outfit-bold' }}
    //         >
    //           {person?.name}
    //         </Text>
    //         <Text
    //           className='text-sm text-center color-slate-600'
    //           style={{ fontFamily: 'outfit-regular' }}
    //         >
    //           {person?.title}
    //         </Text>
    //       </View>
    //     </View>
    //   </View>
    // </TouchableOpacity>

    // New Card 2
    <TouchableOpacity
      onPress={() => onPersonPress(code, name)}
      activeOpacity={0.7}
    >
      {/* <View
        className='w-52 h-80 ml-2 mr-2 mb-5 p-2 rounded-2xl bg-persons overflow-hidden relative'
        style={styles.shadow}
      > */}
      <LinearGradient
        colors={[
          '#001920', // deep navy black (bottom base)
          '#00181f', // dark desaturated blue
          '#093341', // mid-indigo layer
          '#1E4451', // soft vibrant blue
          '#2B505D', // light glow blue (top-right)
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]} // smooth transitions
        start={{ x: 0, y: 0 }} // bottom left
        end={{ x: 0, y: 1 }} // top right
        style={[
          styles.shadow,
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
            marginHorizontal: 10,
            marginBottom: 30,
            paddingHorizontal: 10,
            borderRadius: 25,
            overflow: 'hidden',
            position: 'relative',
            height: 320,
            width: 210,
          },
        ]}
      >
        <Image
          source={images.FRGhalflogo}
          tintColor='#f6f6f6'
          className='absolute bottom-[-45] self-center w-48 h-48 opacity-30 rotate-180'
          resizeMode='contain'
        />

        {/* Rotating Waves */}
        <Animated.View
          style={[
            styles.wave,
            {
              transform: [{ rotate: spin(rotateAnim1) }],
              backgroundColor: '#f6f6f6',
              opacity: 0.3,
            },
          ]}
        />

        {/* <Animated.View
          style={[
            styles.wave,
            {
              transform: [{ rotate: spin(rotateAnim1) }],
              backgroundColor: '#c7c7c7',
              opacity: 0.5,
              top: 50,
            },
          ]}
        /> */}

        {/* <Animated.View
          style={[
            styles.wave,
            {
              transform: [{ rotate: spin(rotateAnim1) }],
              backgroundColor: '#c7c7c7',
              opacity: 0.4,
              top: 50,
            },
          ]}
        /> */}

        {/* Info */}
        <Image
          source={
            person?.imageUrl === ''
              ? images.FRGiansBG
              : { uri: person?.imageUrl }
          }
          className='w-40 h-40 mt-5 self-center rounded-full bg-secondary'
        />
        <View className='mt-10'>
          <Text
            className='text-xl mt-1 text-center text-white'
            style={{ fontFamily: 'outfit-bold' }}
          >
            {person?.name}
          </Text>
          <Text
            className='text-sm text-center text-coTitle'
            style={{ fontFamily: 'outfit-regular' }}
          >
            {person?.title}
          </Text>
        </View>
      </LinearGradient>
      {/* </View> */}
    </TouchableOpacity>
  );
};

export default PersonCardItem;

// Old Card
// const styles = StyleSheet.create({
//   shadow: {
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 3,
//     },
//     shadowOpacity: 0.27,
//     shadowRadius: 4.65,

//     elevation: 6,
//   },
// });

// // New Crad 1
// const styles = StyleSheet.create({
//   wrapper: {
//     width: 208,
//     height: 288,
//     borderRadius: 10,
//     padding: 1,
//     backgroundColor: '#021526',
//     overflow: 'hidden',
//     position: 'relative',
//     alignSelf: 'center',
//     marginVertical: 40,
//   },
//   dot: {
//     width: 5,
//     height: 5,
//     position: 'absolute',
//     backgroundColor: '#fff',
//     borderRadius: 100,
//     shadowColor: '#fff',
//     shadowOpacity: 1,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 0 },
//     zIndex: 2,
//   },
//   card: {
//     flex: 1,
//     borderRadius: 9,
//     borderWidth: 1,
//     borderColor: '#202222',
//     backgroundColor: '#021526',
//     alignItems: 'center',
//     justifyContent: 'center',
//     position: 'relative',
//   },
//   ray: {
//     width: 270,
//     height: 45,
//     borderRadius: 100,
//     backgroundColor: '#c7c7c7',
//     opacity: 0.2,
//     position: 'absolute',
//     top: 0,
//     left: -120,
//     transform: [{ rotate: '40deg' }],
//     shadowColor: '#ffffff',
//     shadowOpacity: 1,
//     shadowRadius: 50,
//     shadowOffset: { width: 0, height: 0 },
//   },
//   text: {
//     fontWeight: 'bold',
//     fontSize: 40,
//     color: '#fff',
//   },
//   subtext: {
//     fontSize: 16,
//     color: '#ccc',
//   },
//   line: {
//     position: 'absolute',
//     backgroundColor: '#2c2c2c',
//   },
//   topl: {
//     top: '10%',
//     height: 1,
//     width: '100%',
//     backgroundColor: '#888888',
//     opacity: 0.5,
//   },
//   bottoml: {
//     bottom: '10%',
//     height: 1,
//     width: '100%',
//   },
//   leftl: {
//     left: '10%',
//     width: 1,
//     height: '100%',
//     backgroundColor: '#747474',
//     opacity: 0.5,
//   },
//   rightl: {
//     right: '10%',
//     width: 1,
//     height: '100%',
//   },
// });

// New Card 2
const styles = StyleSheet.create({
  wave: {
    position: 'absolute',
    width: 540,
    height: 700,
    left: -270,
    top: -570,
    borderRadius: 250,
  },
  shadow: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 6,
  },
});
