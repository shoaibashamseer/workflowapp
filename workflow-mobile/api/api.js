import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
    //baseURL: "http://192.168.43.184:8000/api/",
    // baseURL: "http://10.0.2.2:8000/api/",
      baseURL: "https://workflowapp.pythonanywhere.com/api/",
});

// attach token automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;
