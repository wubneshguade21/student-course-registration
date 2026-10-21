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

export const updateProfile = (data) => {
  return api.put("/auth/profile", data);
};

export const getSystemSettings = () => {
  return api.get("/auth/settings");
};

export const updateSystemSettings = (data) => {
  return api.put("/auth/settings", data);
};

export const resetStudentPassword = (studentId) => {
  return api.post(`/auth/reset-password/${studentId}`);
};

export const getActivities = () => {
  return api.get("/auth/activities");
};