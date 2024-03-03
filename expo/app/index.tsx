import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MainPage } from "../components/MainPage";

export { ErrorBoundary } from "expo-router";

export default function App() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const { data, isLoading } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch("http://localhost:5000/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.json();
    },
  });

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <>
      <SignedIn>
        <SafeAreaProvider>
          <View>
            <MainPage />
          </View>
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
    </>
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
