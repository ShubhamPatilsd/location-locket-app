import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { MainPage } from "../../../components/MainPage";
export { ErrorBoundary } from "expo-router";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  const { getToken, userId } = useAuth();
  const { id } = useLocalSearchParams();
  const bottomSheetRef = useRef<BottomSheet>(null);

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

  const renderItem = useCallback(
    ({ item }: any) => (
      <View className="flex flex-row items-center py-2 px-4 gap-2">
        <Image
          className="w-10 h-10 rounded-full"
          source={{ uri: item.user.profilePicture }}
        />
        <View className="flex-1">
          <Text className="text-base font-medium">
            {item.user.firstName} {item.user.lastName}
          </Text>
          <Text>{item.user.email}</Text>
        </View>
        <Text className="text-gray-500">
          {item.user.id === userId ? "You" : "5mi"}
        </Text>
      </View>
    ),
    [],
  );

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <GestureHandlerRootView>
      <View>
        <MainPage group={data} />
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={["25%", "50%", "90%"]}
        >
          <BottomSheetFlatList
            data={data?.users || []}
            keyExtractor={(i: number) => i.toString()}
            renderItem={renderItem}
          />
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}
