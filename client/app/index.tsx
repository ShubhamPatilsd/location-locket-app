import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, StyleSheet, Text } from "react-native";
import { MainPage } from "../components/MainPage";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <SignedIn>
        <MainPage />
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
      <StatusBar style="auto" />
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
