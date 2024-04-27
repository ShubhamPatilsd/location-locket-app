import { Pressable, Text, View } from "react-native";

const CaptureScreen = () => {
  return (
    <View className="flex items-center justify-center">
      <View className="bg-black w-4/5 h-3/4 rounded-2xl" />
      <Text className="text-2xl mt-4">Caption</Text>
      <Pressable className="bg-blue-500 p-2 rounded-lg mt-4">
        <Text className="text-white">Post</Text>
      </Pressable>
    </View>
  );
};

export default CaptureScreen;
