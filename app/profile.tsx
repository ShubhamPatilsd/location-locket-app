import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-expo";
import * as React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SafeMyProfileScreen() {
  return (
    <>
      <SignedIn>
        <MyProfileScreen />
      </SignedIn>
      <SignedOut>
        <View style={styles.container}>
          <Text>Unauthorized</Text>
        </View>
      </SignedOut>
    </>
  );
}

function MyProfileScreen() {
  const { signOut } = useAuth();
  const { user, isLoaded, isSignedIn } = useUser();

  const onSignOutPress = async () => {
    try {
      await signOut();
    } catch (err: any) {
      console.log("Error:> " + err?.status || "");
      console.log("Error:> " + err?.errors ? JSON.stringify(err.errors) : err);
    }
  };

  if (!isLoaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello {user?.firstName}</Text>
      <TouchableOpacity onPress={onSignOutPress} style={styles.link}>
        <Text style={styles.linkText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
  token: {
    marginTop: 15,
    paddingVertical: 15,
    fontSize: 15,
  },
});
