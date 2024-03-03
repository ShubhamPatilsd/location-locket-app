import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { MainPage } from "../../components/MainPage";

export { ErrorBoundary } from "expo-router";

export default function App() {
  const { getToken } = useAuth();
  const { id } = useLocalSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`http://localhost:5000/group/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
  });

  useEffect(() => {
    if (isLoading) return;
    if (data) AsyncStorage.setItem("recent-group", data.id);
  }, [isLoading, data]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <MainPage group={data} />
    </View>
  );
}
