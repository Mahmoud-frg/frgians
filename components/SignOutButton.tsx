import { useClerk } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to your desired page
      Linking.openURL(Linking.createURL('/sign-in'));
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      // console.error(JSON.stringify(err, null, 2));
      alert(err.errors[0].longMessage);
    }
  };

  return (
    <View className='w-96 mx-auto mt-10 rounded-lg shadow-2xl'>
      <TouchableOpacity
        onPress={handleSignOut}
        className='w-full px-4 py-3 rounded-lg bg-title'
        style={styles.shadow}
      >
        <Text className='mx-auto text-xl font-bold text-white'>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignOutButton;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 6,
  },
});
