import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MainPage } from "../components/MainPage";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

export { ErrorBoundary } from "expo-router";

export default function App() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  return (
    <>
      <SignedIn>
        <SafeAreaProvider>
          <View>
            <MainPage />
            <View
              style={{
                marginTop: insets.top,
                position: "absolute",
                height: height - 0.1 * height,
                width: width,
                padding: 25,
                pointerEvents: "box-none",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  ImagePicker.launchCameraAsync();
                }}
                style={{
                  borderRadius: 100,
                  position: "absolute",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  bottom: 25,
                  right: 25,
                  width: 50,
                  height: 50,
                  backgroundColor: "black",
                }}
              >
                <Ionicons name="camera-outline" size={25} color={"white"} />
              </TouchableOpacity>
            </View>
          </View>
          <StatusBar backgroundColor={"transparent"} translucent />
        </SafeAreaProvider>
      </SignedIn>
      <SignedOut>
        <Link href="/signIn" asChild>
          <Pressable>
            <Text>Sign in</Text>
          </Pressable>
        </Link>

        <Link href="/signUp" asChild>
          <Pressable>
            <Text>Sign up</Text>
          </Pressable>
        </Link>
      </SignedOut>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // alignItems: "center",
    // justifyContent: "center",
  },
});
