import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import api from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ChangePasswordScreen({ onDone }) {
  const [password, setPassword] = useState("");

  const submit = async () => {
    await api.post("auth/change-password/", {
      new_password: password
    });

    await AsyncStorage.setItem("must_change_password", "false");
    onDone();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Change Password</Text>

      <TextInput
        placeholder="New password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginVertical: 8, padding: 8 }}
      />

      <Button title="Update Password" onPress={submit} />
    </View>
  );
}
