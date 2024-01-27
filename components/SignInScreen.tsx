import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [code, setCode] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      await signIn.create({ identifier: emailAddress });
      await signIn.prepareFirstFactor({ strategy: "email_code", emailAddressId: emailAddress });
      setVerifying(true);
    } catch (err: any) {
      console.log(err);
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
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View>
      {!verifying && (
        <View>
          <View>
            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Email..."
              onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
            />
          </View>

          <TouchableOpacity onPress={onSignInPress}>
            <Text>Sign in</Text>
          </TouchableOpacity>
        </View>
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
