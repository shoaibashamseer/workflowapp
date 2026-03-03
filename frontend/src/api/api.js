import axios from "axios";

const api = axios.create({
  baseURL: "https://workflowapp.pythonanywhere.com/api/",
 // baseURL: "http://localhost:8000/api/",

});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;
