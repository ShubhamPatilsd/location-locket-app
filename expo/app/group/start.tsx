import { Link, router } from "expo-router";
import * as React from "react";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../components/Styles";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@clerk/clerk-expo";

export default function StartGroupPage() {
  const { getToken } = useAuth();
  const [groupName, setGroupName] = React.useState("");
  const createGroup = useMutation({
    mutationFn: async (newGroup: { name: string }) => {
      const token = await getToken();
      return axios.post("http://localhost:5000/group/start", newGroup, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      alert("Group created");
      router.replace("/");
    },
    onError: (error) => {
      alert(error);
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.inputView}>
        <TextInput
          autoCapitalize="none"
          value={groupName}
          style={styles.textInput}
          placeholder="Enter Group Name..."
          onChangeText={(groupId) => setGroupName(groupId)}
        />
      </View>

      <TouchableOpacity
        onPress={() => {
          if (!groupName) return alert("Please enter a group name");
          createGroup.mutate({ name: groupName });
        }}
        disabled={createGroup.isPending}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Start shenanigans</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text>OR</Text>

        <Link href="/group/join" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Join shenanigans</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
