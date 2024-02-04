import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import MapView from "react-native-maps";

export const MainPage = () => {
  return (
    <View>
      {/* <Text>You are Signed in</Text>
      <Link href="/profile" asChild>
        <Pressable>
          <Text>Profile</Text>
        </Pressable>
      </Link> */}

      <MapView />
    </View>
  );
};
