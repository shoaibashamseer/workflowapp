import api from "./api";

export const createWorkflow = async (data) => {
  const res = await api.post("manager/workflows/", data);
  return res.data;
};

export const addWorkflowStep = async (data) => {
  const res = await api.post("manager/workflow-steps/", data);
  return res.data;
};

export const fetchProducts = async () => {
  const res = await api.get("manager/products/");
  return res.data;
};

export const fetchRoles = async () => {
  const res = await api.get("roles/");
  return res.data;
};
