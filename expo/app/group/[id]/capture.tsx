import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Camera, CameraCapturedPicture, CameraType } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export default function CameraScreen() {
  const [status, requestPermission] = Camera.useCameraPermissions();
  const [type, setType] = useState(CameraType.back);
  const [pictures, setPictures] = useState<
    Record<CameraType, CameraCapturedPicture | null>
  >({
    [CameraType.front]: null,
    [CameraType.back]: null,
  });

  const cameraRef = useRef<Camera>(null);
  const { width, height } = useWindowDimensions();
  const otherPicture = pictures[otherSide()];
  const [cameraReady, setCameraReady] = useState(false);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    requestPermission();
  }, []);

  if (!status || !status.granted) {
    return <View />;
  }

  function otherSide() {
    if (type == CameraType.back) {
      return CameraType.front;
    }

    return CameraType.back;
  }

  function swapCamera() {
    setType(otherSide());
  }

  function submitPicture() {
    // const post = {
    //   id: posts.length,
    //   user: {
    //     handle: profile.handle,
    //     profile: profile.profile,
    //   },
    //   likes: 0,
    //   dislikes: 0,
    //   location: {
    //     city: profile.location.city,
    //     state: profile.location.state,
    //   },
    //   image: {
    //     front: pictures[CameraType.front].uri,
    //     back: pictures[CameraType.back].uri,
    //   },
    // };

    return true;
  }

  function hasBothPictures() {
    return (
      pictures[CameraType.front] !== null && pictures[CameraType.back] !== null
    );
  }

  async function takePicture() {
    if (!cameraRef.current) return;

    const picture = await cameraRef.current.takePictureAsync();
    await cameraRef.current.resumePreview();
    setCameraReady(false);

    setPictures({ ...pictures, [type]: picture });

    if (!otherPicture) swapCamera();
    else {
      await cameraRef.current.pausePreview();
    }
  }

  async function retakePictures() {
    if (!cameraRef.current) return;

    setPictures({ [CameraType.front]: null, [CameraType.back]: null });
    setCameraReady(true);
    await cameraRef.current.resumePreview();
  }

  return (
    <View className="flex items-center justify-center flex-1 p-4 gap-2">
      <Camera
        onCameraReady={() => setCameraReady(true)}
        ref={cameraRef}
        className="w-11/12 h-5/6 rounded-md overflow-hidden"
        type={type}
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
      </Camera>
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
