import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-expo";
import * as React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../components/Styles";
import { Link, router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function JoinGroupPage() {
  const { getToken } = useAuth();
  const [groupCode, setGroupCode] = React.useState("");
  const joinGroup = useMutation({
    mutationFn: async (newGroup: { code: string }) => {
      const token = await getToken();
      return axios.post(`${process.env.EXPO_PUBLIC_API_URL}/group/join`, newGroup, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      alert("Group joined!");
      router.replace("/");
    },
    onError: (error) => {
      console.error(error);
      alert(error);
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.inputView}>
        <TextInput
          autoCapitalize="none"
          value={groupCode}
          style={styles.textInput}
          placeholder="Enter 8-digit group code..."
          onChangeText={(groupId) => setGroupCode(groupId)}
          maxLength={8}
          textContentType="oneTimeCode"
          keyboardType="number-pad"
        />
      </View>

      <TouchableOpacity
        onPress={() => {
          if (!groupCode) return alert("Please enter a group code");
          if (groupCode.length !== 8)
            return alert("Group code must be 8 digits");
          joinGroup.mutate({ code: groupCode });
        }}
        disabled={joinGroup.isPending}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Join Shenanigans</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text>OR</Text>

        <Link href="/group/start" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              Start your own shenanigans
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
