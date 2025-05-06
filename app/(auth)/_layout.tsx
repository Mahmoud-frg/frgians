import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href={"/home"} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* <Stack.Screen
        name='(tabs)'
        options={{
          headerShown: false,
        }}
      /> */}

      <Stack.Screen
        name="sign-in"
        options={{
          headerTitle: "Clerk Auth App",
        }}
      ></Stack.Screen>
      <Stack.Screen
        name="sign-up"
        options={{
          headerTitle: "Create Account",
        }}
      ></Stack.Screen>
      <Stack.Screen
        name="pw-reset"
        options={{
          headerTitle: "Reset Password",
        }}
      ></Stack.Screen>
    </Stack>
  );
}
