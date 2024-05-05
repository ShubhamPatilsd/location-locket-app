import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { Link, router, Stack } from "expo-router";
import * as React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export { ErrorBoundary } from "expo-router";

export default function App() {
  const { getToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/groups`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.json();
    },
  });

  React.useEffect(() => {
    if (isLoading) return;
    if (data.length < 0) router.replace("/group/join");
  }, [isLoading, data]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: (props) => <Text {...props}>Your Groups</Text>,
        }}
      />
      <FlatList
        style={styles.list}
        keyExtractor={(item) => item.id}
        data={data}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push(`/group/${item.id}`)}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <Link href="/group/join" asChild>
        <Text style={{ textAlign: "center", marginTop: 5 }}>Join a group</Text>
      </Link>
      <Link href="/group/start" asChild>
        <Text style={{ textAlign: "center", marginTop: 5 }}>Start a group</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  list: {
    width: "100%",
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  listItem: {
    padding: 10,
  },
});
