import api from "./axios";

export const getAdminStats = () => api.get("/dashboard");
export const getMyStats = () => api.get("/dashboard/me");