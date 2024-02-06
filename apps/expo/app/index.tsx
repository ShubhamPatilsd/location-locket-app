import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { MainPage } from "../components/MainPage";
import { TRPCProvider } from "../utils/trpc";

export { ErrorBoundary } from "expo-router";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
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
