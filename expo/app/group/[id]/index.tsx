import { useAuth } from "@clerk/clerk-expo";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import distFrom from "distance-from";
import * as Location from "expo-location";
import { useMutation } from "@tanstack/react-query";
import MapView, { Marker } from "react-native-maps";

export default function MapPage() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const params = useLocalSearchParams();
  const group = JSON.parse((params.group as string) || "{}");

  const [location, setLocation] = useState<Location.LocationObject>();
  const [errorMsg, setErrorMsg] = useState<string>("null");

  const { width, height } = useWindowDimensions();
  const { getToken, userId } = useAuth();

  const styles = StyleSheet.create({
    container: { position: "relative" },
    toolbar: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: "white",
      borderTopLeftRadius: 100,
      borderTopRightRadius: 100,
      paddingVertical: 15,
      zIndex: 12,
      position: "absolute",
      width: width,
      bottom: 97,
    },
    button: {
      padding: 10,
    },
    middleButton: {
      backgroundColor: "#f0f0f0",
      borderRadius: 30,
      paddingVertical: 15,
      paddingHorizontal: 20,
    },
    map: {
      width: width,
      height: height,
    },
  });

  const mutateLocation = useMutation({
    mutationFn: async (location: any) => {
      const token = await getToken();
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/location`,
        location,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return response.data;
    },
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      mutateLocation.mutate(location.coords);
    })();
  }, []);

  return (
    <>
      <GestureHandlerRootView>
        <View>
          <View style={styles.container}>
            {location && (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location?.coords.latitude,
                  longitude: location?.coords.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                showsUserLocation
                showsMyLocationButton={true}
                zoomEnabled={true}
                zoomControlEnabled={true}
                zoomTapEnabled={true}
              >
                {group.users
                  .filter(
                    ({ user }: any) => user.location && userId !== user.id,
                  )
                  .map(({ user }: any) => (
                    <Marker
                      key={user.id}
                      coordinate={{
                        latitude: user.location.latitude,
                        longitude: user.location.longitude,
                      }}
                      title={user.name}
                      image={{ uri: user.profilePicture }}
                    />
                  ))}
                {group.posts
                  .filter(
                    (post: any) =>
                      new Date(post.createdAt).getTime() >
                      new Date().getTime() - 1000 * 60 * 60 * 24 * 7,
                  )
                  .map((post: any) => (
                    <Marker
                      key={post.location.id}
                      coordinate={{
                        latitude: post.location.latitude,
                        longitude: post.location.longitude,
                      }}
                    >
                      <Image
                        className="w-8 h-8 rounded-sm border-gray-400 border-2"
                        source={{ uri: post.frontImage }}
                      />
                    </Marker>
                  ))}
              </MapView>
            )}
          </View>
          <BottomSheet
            ref={bottomSheetRef}
            index={1}
            snapPoints={["25%", "50%", "90%"]}
          >
            <BottomSheetFlatList
              data={group?.users || []}
              keyExtractor={(i: any) => i.user.id}
              renderItem={({ item }) => (
                <UserItem currentLocation={location?.coords} item={item} />
              )}
            />
          </BottomSheet>
        </View>
      </GestureHandlerRootView>
    </>
  );
}

const UserItem = ({ item, currentLocation }: any) => {
  const { userId } = useAuth();

  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");

  useEffect(() => {
    if (!item || !item.user.location) return;
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
        {item.user.id === userId
          ? "You"
          : item.user.location.latitude &&
            item.user.location.longitude &&
            currentLocation?.latitude &&
            currentLocation?.longitude
          ? distFrom([currentLocation.latitude, currentLocation.longitude])
              .to([
                item.user.location.latitude,
                item.user.location.longitude + 0.0001,
              ])
              .in("miles")
              .toFixed(1) + " mi"
          : "--"}
      </Text>
    </View>
  );
};
