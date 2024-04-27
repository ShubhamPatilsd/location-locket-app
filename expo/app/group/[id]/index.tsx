import { useAuth } from "@clerk/clerk-expo";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Image, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MainPage } from "../../../components/MainPage";

export default function MapPage() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const params = useLocalSearchParams();
  const group = JSON.parse(params.group as string || "{}");

  return (
    <>
      <GestureHandlerRootView>
        <View>
          <MainPage group={group} />
          <BottomSheet
            ref={bottomSheetRef}
            index={1}
            snapPoints={["25%", "50%", "90%"]}
          >
            <BottomSheetFlatList
              data={group?.users || []}
              keyExtractor={(i: number) => i.toString()}
              renderItem={({ item }) => <UserItem item={item} />}
            />
          </BottomSheet>
        </View>
      </GestureHandlerRootView>
    </>
  );
}

const UserItem = ({ item }: any) => {
  const { userId } = useAuth();

  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");

  useEffect(() => {
    if (!item) return;
    if (city || state) return;

    axios
      .get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${item.user.location.latitude}&longitude=${item.user.location.longitude}&localityLanguage=en`,
      )
      .then((response) => {
        if (!response.data) return;

        if (response.data.city) setCity(response.data.city);
        if (response.data.principalSubdivision)
          setState(response.data.principalSubdivision);
      });
  }, [item]);

  return (
    <View className="flex flex-row items-center py-2 px-4 gap-2">
      <Image
        className="w-10 h-10 rounded-full"
        source={{ uri: item.user.profilePicture }}
      />
      <View className="flex-1">
        <Text className="text-base font-medium">
          {item.user.firstName} {item.user.lastName}
        </Text>
        <Text className="text-gray-600">
          {city ? `${city}, ` : ""}
          {state ? state : ""}
          {!city && !state && "Address Unavailable"}
        </Text>
      </View>
      <Text className="text-gray-500">
        {item.user.id === userId ? "You" : "5mi"}
      </Text>
    </View>
  );
};
