import api from "./axios";

export const loginUser = (email, password) =>
  api.post("/auth/login", { email, password });

export const registerUser = (name, email, password) =>
  api.post("/auth/register", { name, email, password });

export const changePassword = (currentPassword, newPassword) =>
  api.post("/auth/change-password", { currentPassword, newPassword });

export const getMyPermissions = () => api.get("/auth/permissions");

export const updateMyDepartment = (department_id) =>
  api.put("/auth/department", { department_id });