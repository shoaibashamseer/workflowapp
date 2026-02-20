import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginScreen from "./screens/LoginScreen";
import TasksScreen from "./screens/TasksScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";

export default function App() {
  const [user, setUser] = useState(null);
  const [mustChange, setMustChange] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔐 Check saved auth on app start
  useEffect(() => {
    const loadAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      const userStr = await AsyncStorage.getItem("user");
      const mcp = await AsyncStorage.getItem("must_change_password");

      if (token && userStr) {
        setUser(JSON.parse(userStr));
        setMustChange(mcp === "true");
      }

      setLoading(false);
    };

    loadAuth();
  }, []);

  // 🔓 Called after successful login
  const handleLogin = (userData, mustChangePassword) => {
    setUser(userData);
    setMustChange(mustChangePassword);
  };

  // 🚪 Logout
  const handleLogout = async () => {
    await AsyncStorage.clear();
    setUser(null);
    setMustChange(false);
  };

  if (loading) {
    return null; // or splash screen
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (mustChange) {
    return <ChangePasswordScreen onDone={() => setMustChange(false)} />;
  }

  return <TasksScreen user={user} onLogout={handleLogout} />;
}
