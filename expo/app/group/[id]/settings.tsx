import { useAuth } from "@clerk/clerk-expo";
import { useLocalSearchParams } from "expo-router";
import * as React from "react";
import { Pressable, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";

const SettingsPage = () => {
  const { getToken } = useAuth();
  const params = useLocalSearchParams();
  const group = JSON.parse((params.group as string) || "{}");

  const copyToClipboard = async () => {
    if (!group.code) return;
    await Clipboard.setStringAsync(group.code.toString());
    alert("Group code copied to clipboard!");
  };

  return (
    <View className="p-10 flex flex-col justify-between h-full">
      <View className="flex flex-col gap-2">
        <Pressable
          className="p-5 bg-gray-200 rounded-md border"
          onPress={copyToClipboard}
        >
          <Text className="text-center">Invite Your Friends</Text>
        </Pressable>
        <View className="p-5 bg-orange-500/30 border border-orange-500 rounded-md">
          <Text className="text-center tracking-[12px] text-2xl font-black text-orange-600">
            {group.code}
          </Text>
        </View>
      </View>
      <Pressable className="p-5 bg-gray-200 rounded-md border">
        <Text className="text-center">Leave Group</Text>
      </Pressable>
    </View>
  );
};

export default SettingsPage;
