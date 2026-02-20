import api from "./api";

export const createProduct = async (data) => {
  const response = await api.post("manager/products/", data);
  return response.data;
};
