import { useAuth } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import axios from "axios";
import {
  CameraCapturedPicture,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import FormData from "form-data";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export default function CameraScreen() {
  const [status, requestPermission] = useCameraPermissions();
  const [type, setType] = useState<CameraType>("back");
  const [pictures, setPictures] = useState<
    Record<CameraType, CameraCapturedPicture | null>
  >({ back: null, front: null });

  const cameraRef = useRef<CameraView>(null);
  const { width, height } = useWindowDimensions();
  const otherPicture = pictures[otherSide()];
  const [cameraReady, setCameraReady] = useState(false);
  const [caption, setCaption] = useState("");

  const { getToken } = useAuth();
  const params = useLocalSearchParams();
  const group = JSON.parse((params.group as string) || "{}");

  useEffect(() => {
    requestPermission();
  }, []);

  if (!status || !status.granted) {
    return <View />;
  }

  function otherSide() {
    if (type == "back") {
      return "front" as CameraType;
    }

    return "back" as CameraType;
  }

  function swapCamera() {
    setType(otherSide());
  }

  async function submitPicture() {
    if (!pictures.front || !pictures.back) return;

    const location = await Location.getCurrentPositionAsync({});
    const token = await getToken();

    return axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/upload`,
      {
        groupId: group.id,
        caption,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        front: {
          raw: pictures.front.base64,
          name: `front-${Date.now()}.jpg`,
          type: `image/${pictures.front.uri.split(".").pop()}`,
        },
        back: {
          raw: pictures.back.base64,
          name: `back-${Date.now()}.jpg`,
          type: `image/${pictures.back.uri.split(".").pop()}`,
        },
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  }

  function hasBothPictures() {
    return pictures.front !== null && pictures.back !== null;
  }

  async function takePicture() {
    if (!cameraRef.current) return;

    const picture = await cameraRef.current.takePictureAsync({ base64: true });
    // await cameraRef.current.resumePreview();
    setCameraReady(false);

    setPictures({ ...pictures, [type]: picture });

    if (!otherPicture) swapCamera();
    else {
      // await cameraRef.current.pausePreview();
    }
  }

  async function retakePictures() {
    if (!cameraRef.current) return;

    setPictures({ front: null, back: null });
    setCameraReady(true);
    // await cameraRef.current.resumePreview();
  }

  return (
    <View className="flex items-center justify-center flex-1 p-4 gap-2">
      <CameraView
        onCameraReady={() => setCameraReady(true)}
        ref={cameraRef}
        className="w-11/12 h-5/6 rounded-md overflow-hidden"
        facing={type}
      >
        {otherPicture !== null && (
          <Image
            source={{ uri: otherPicture.uri }}
            style={{ width: 0.24 * width, height: 0.24 * height }}
            className="absolute top-4 right-4 bg-transparent rounded-md border"
          />
        )}
        {hasBothPictures() && (
          <View className="absolute bottom-4 left-0 right-0 justify-center items-center">
            <TouchableOpacity onPress={retakePictures}>
              <Text className="text-white font-semibold text-lg">Re-take</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          onPress={swapCamera}
          className="absolute bottom-4 right-4"
        >
          <FontAwesome6 name="camera-rotate" size={35} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={takePicture}
          className="absolute bottom-4 left-4"
        >
          <FontAwesome name="camera" size={35} color="white" />
        </TouchableOpacity>
      </CameraView>
      <View className="flex flex-row justify-center items-center">
        <TextInput
          autoCapitalize="none"
          placeholder="Caption your memory"
          value={caption}
          onChangeText={(value) => setCaption(value)}
          className="flex-1 h-12 rounded-md border p-2 bg-white"
        />
        <TouchableOpacity
          disabled={!hasBothPictures()}
          onPress={submitPicture}
          className="ml-2"
        >
          <FontAwesome
            name="send"
            size={24}
            color={hasBothPictures() ? "black" : "#868e96"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
