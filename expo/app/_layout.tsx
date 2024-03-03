import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import NetInfo from "@react-native-community/netinfo";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from "@tanstack/react-query";
import { Link, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient();

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

export default function RootLayout() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
    >
      <ThemeProvider value={DefaultTheme}>
        <QueryClientProvider client={queryClient}>
          <SignedIn>
            <SafeAreaProvider>
              <Stack />
              <StatusBar backgroundColor={"transparent"} translucent />
            </SafeAreaProvider>
          </SignedIn>
          <SignedOut>
            <View style={styles.container}>
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
            </View>
          </SignedOut>
        </QueryClientProvider>
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
