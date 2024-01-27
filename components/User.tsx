import { useUser } from "@clerk/clerk-expo";
import { Text } from "react-native";

export default function User() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return <Text>Hello, {user.firstName} welcome to Clerk</Text>;
}
