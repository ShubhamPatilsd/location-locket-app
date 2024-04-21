import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import * as React from "react";
import { Text } from "react-native";

const MemoriesPage = () => {
  const { getToken } = useAuth();
  const { id } = useLocalSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`http://localhost:5000/group/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
  });

  return <Text>MemoriesPage</Text>;
};

export default MemoriesPage;
