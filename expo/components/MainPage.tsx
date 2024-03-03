import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";

export const MainPage = () => {
  const [location, setLocation] = useState<Location.LocationObject>();
  const [errorMsg, setErrorMsg] = useState<string>("null");

  const { width, height } = useWindowDimensions();

  const styles = StyleSheet.create({
    container: { position: "relative" },
    map: {
      width: width,
      height: height,
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
    })();
  }, []);

  return (
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
          showsCompass={false}
          showsUserLocation
          showsMyLocationButton={true}
        />
      )}
    </View>
  );
};
