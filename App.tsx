import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import SignUpScreen from "./components/SignUpScreen";
import * as SecureStore from "expo-secure-store";
import User from "./components/User";

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function App() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.CLERK_PUBLISHABLE_KEY as string}
    >
      <SafeAreaView style={styles.container}>
        <SignedIn>
          <Text>You are Signed in</Text>
          <User />
          <SignedOut />
        </SignedIn>
        <SignedOut>
          <SignUpScreen />
        </SignedOut>
        <StatusBar style="auto" />
      </SafeAreaView>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
