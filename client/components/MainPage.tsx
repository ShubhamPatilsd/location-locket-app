import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";

export const MainPage = () => {
  const [location, setLocation] = useState<Location.LocationObject>();
  const [errorMsg, setErrorMsg] = useState<string>("null");

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
      <MapView
        style={styles.map}
        // initialRegion={{
        //   latitude: 37.78825,
        //   longitude: -122.4324,
        //   latitudeDelta: 0.0922,
        //   longitudeDelta: 0.0421,
        // }}
        showsUserLocation
        followsUserLocation
        showsMyLocationButton={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",

    // position: "absolute",
  },
});
