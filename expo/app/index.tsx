import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export { ErrorBoundary } from "expo-router";

export default function App() {
  const { getToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch("http://localhost:5000/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
  });

  useEffect(() => {
    if (isLoading) return;

    (async () => {
      if (!data || data.length < 0) {
        router.replace("/group/join");
      } else {
        const recentGroupId = await AsyncStorage.getItem("recent-group");
        if (data.find((group: any) => group.id === recentGroupId)) {
          router.replace(`/group/${recentGroupId}`);
        } else {
          await AsyncStorage.setItem("recent-group", data[0].id);
          router.replace(`/group/${data[0].id}`);
        }
      }
    })();
  }, [isLoading, data]);

  return (
    <View>
      <Text>Loading...</Text>
    </View>
  );
}
