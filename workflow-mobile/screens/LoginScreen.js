import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

 const login = async () => {
  try {
    const res = await api.post("auth/login/", {
      username,
      password,
    });

    const userData = {
      id: res.data.id,
      username: res.data.username,
      role: res.data.role,
    };

    await AsyncStorage.setItem("token", res.data.token);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    await AsyncStorage.setItem(
      "must_change_password",
      String(res.data.must_change_password)
    );

    onLogin(userData);
  } catch (err) {
    console.log("login error:", err.response?.data);
    setError(JSON.stringify(err.response?.data));
  }
};

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Worker Login</Text>

      {error && <Text style={{ color: "red" }}>{error}</Text>}

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, marginVertical: 8, padding: 8 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginVertical: 8, padding: 8 }}
      />

      <Button title="Login" onPress={login} />
    </View>
  );
}
