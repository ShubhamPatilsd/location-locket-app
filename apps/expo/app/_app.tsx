import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Link } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { MainPage } from "../components/MainPage";
import { TRPCProvider } from "../utils/trpc";

export { ErrorBoundary } from "expo-router";

export default function App() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
    >
      <ThemeProvider value={DefaultTheme}>
        <SignedIn>
          <TRPCProvider>
            <SafeAreaProvider>
              <SafeAreaView style={styles.container}>
                <MainPage />
              </SafeAreaView>
              <StatusBar style="auto" />
            </SafeAreaProvider>
          </TRPCProvider>
        </SignedIn>
        <SignedOut>
          <Link href="/signIn" asChild>
            <Pressable>
              <Text>Sign in</Text>
            </Pressable>
          </Link>

          <Link href="/signUp" asChild>
            <Pressable>
              <Text>Sign up</Text>
            </Pressable>
          </Link>
        </SignedOut>
      </ThemeProvider>
    </ClerkProvider>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
