import api from "./api";

export const testApi = async () => {
  const response = await api.get("manager/tasks/");
  return response.data;
};
