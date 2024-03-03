import { useAuth } from "@clerk/clerk-expo";
import FoundationIcon from "@expo/vector-icons/Foundation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import MapView from "react-native-maps";

type Props = {
  group: any;
};

export const MainPage: React.FC<Props> = ({ group }) => {
  const [cameraStatus, requestPermission] = ImagePicker.useCameraPermissions();

  const [location, setLocation] = useState<Location.LocationObject>();
  const [errorMsg, setErrorMsg] = useState<string>("null");

  const { width, height } = useWindowDimensions();
  const { getToken } = useAuth();

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
      console.log(location);
      const token = await getToken();
      const response = await axios.post(
        `http://localhost:5000/location`,
        location,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return response.data;
    },
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      await requestPermission();
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
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: (props) => (
            <View {...props}>
              <Text>{group.name}</Text>
            </View>
          ),
        }}
      />
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location?.coords.latitude,
            longitude: location?.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsCompass={false}
          showsUserLocation
          showsMyLocationButton={true}
        />
      )}
      <View style={styles.toolbar}>
        <TouchableOpacity
          onPress={() => router.push("/group/list")}
          style={styles.button}
        >
          <FoundationIcon name="list" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            ImagePicker.launchImageLibraryAsync();
          }}
          style={[styles.button, styles.middleButton]}
        >
          <FoundationIcon name="camera" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/profile")}
        >
          <FoundationIcon name="torso" size={32} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
