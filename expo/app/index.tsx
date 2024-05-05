import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";

export { ErrorBoundary } from "expo-router";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <SignedIn>
        <SignedInView />
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
    </View>
  );
}

const SignedInView = () => {
  const { getToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/groups`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.json();
    },
  });

  useEffect(() => {
    if (isLoading) return;

    (async () => {
      if (!data || data.length < 1) {
        router.replace("/group/join");
      } else {
        const recentGroupId = await AsyncStorage.getItem("recent-group");
        if (data.find((group: any) => group.id === recentGroupId)) {
          router.replace(`/group/list`);
          router.push(`/group/${recentGroupId}`);
        } else {
          await AsyncStorage.setItem("recent-group", data[0].id);
          router.replace(`/group/list`);
          router.push(`/group/${data[0].id}`);
        }
      }
    })();
  }, [isLoading, data]);

  return (
    <View>
      <Text>Loading...</Text>
      <Link href="/profile" asChild>
        <Pressable>
          <Text>Profile</Text>
        </Pressable>
      </Link>
    </View>
  );
};
