import api from "./api";

export const addProductProperty = async (data) => {
  const response = await api.post("manager/product-properties/", data);
  return response.data;
};

export const fetchProducts = async () => {
  const response = await api.get("manager/products/");
  return response.data;
};
