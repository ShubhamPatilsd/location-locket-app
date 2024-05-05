import { useAuth } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { Stack, Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text } from "react-native";
import { Dimensions } from "react-native";

export default function TabLayout() {
  const { getToken } = useAuth();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/group/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.json();
    },
  });

  useEffect(() => {
    if (isLoading) return;
    if (data) AsyncStorage.setItem("recent-group", data.id);
  }, [isLoading, data]);

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: (props) => <Text {...props}>{data.name}</Text>,
          headerBackTitleVisible: false,
        }}
      />
      <Tabs
        screenOptions={{ tabBarActiveTintColor: "blue", headerShown: false }}
      >
        <Tabs.Screen
          name="index"
          initialParams={{ group: JSON.stringify(data) }}
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="home" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="memories"
          initialParams={{ group: JSON.stringify(data) }}
          options={{
            title: "Memories",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="ship" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="me"
          initialParams={{ group: JSON.stringify(data) }}
          options={{
            title: "Me",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="user" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          initialParams={{ group: JSON.stringify(data) }}
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="cog" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="capture"
          initialParams={{ group: JSON.stringify(data) }}
          options={{
            unmountOnBlur: true,
            title: "Capture",
            tabBarButton: () => (
              <Pressable
                onPress={() => router.push("/group/[id]/capture")}
                className="p-4 rounded-full bg-red-500 absolute bottom-5 z-10 shadow"
                style={{ left: Dimensions.get("window").width / 2 - 28 }}
              >
                <FontAwesome size={28} name="camera" color="white" />
              </Pressable>
            ),
          }}
        />
      </Tabs>
    </>
  );
}
