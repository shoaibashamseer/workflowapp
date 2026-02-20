import api from "./api";

export const fetchProducts = () => api.get("manager/products/").then(r => r.data);
export const fetchWorkflows = (productId) =>
  api.get(`manager/workflows/?product=${productId}`).then(r => r.data);

export const fetchCustomers = () => api.get("customers/").then(r => r.data);
export const createCustomer = (data) => api.post("customers/", data).then(r => r.data);

export const createOrder = (data) => api.post("orders/", data).then(r => r.data);
