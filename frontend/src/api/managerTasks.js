import axios from "axios";

export const fetchManagerTasks = async () => {
  const response = await axios.get("/api/manager/tasks/");
  return response.data;
};
