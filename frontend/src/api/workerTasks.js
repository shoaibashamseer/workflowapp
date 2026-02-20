import api from "./api";

export const fetchTasksByRole = (role) =>
  api.get(`tasks/?role=${role}`).then(r => r.data);

export const startTask = (taskId) =>
  api.post(`tasks/${taskId}/start/`);

export const completeTask = (taskId) =>
  api.post(`tasks/${taskId}/complete/`);
