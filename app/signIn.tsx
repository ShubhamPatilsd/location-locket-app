import React from "react";
import { Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { styles } from "../components/Styles";
import { Link, router } from "expo-router";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [code, setCode] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const auth = await signIn.create({ identifier: emailAddress });

      console.log(auth.supportedFirstFactors, auth.supportedIdentifiers);

      await auth.prepareFirstFactor({
        strategy: "email_code",
        identifier: auth.supportedFirstFactors[0].email,
      });
      setVerifying(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;

    try {
      const completeSignIn = await signIn.attemptFirstFactor({ code, strategy: "email_code" });

      if (completeSignIn.status !== "complete") {
        console.error(JSON.stringify(completeSignIn, null, 2));
      }

      await setActive({ session: completeSignIn.createdSessionId });
      router.push("/");
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={styles.container}>
      {!verifying && (
        <>
          <View style={styles.inputView}>
            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              style={styles.textInput}
              placeholder="Email..."
              onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={onSignInPress}>
            <Text style={styles.primaryButtonText}>Sign in</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text>Don't have an account?</Text>

            <Link href="/signUp" asChild>
              <Pressable style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </>
      )}
      {verifying && (
        <View>
          <View>
            <TextInput
              autoCapitalize="none"
              value={code}
              placeholder="Code..."
              onChangeText={(code) => setCode(code)}
            />
          </View>

          <TouchableOpacity onPress={onPressVerify}>
            <Text>Verify</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
