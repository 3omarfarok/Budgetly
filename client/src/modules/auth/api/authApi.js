import api from "../../../utils/api";

export const authApi = {
  login: ({ username, password }) => api.post("/auth/login", { username, password }),

  register: ({ username, password, name, email }) =>
    api.post("/auth/register", { username, password, name, email }),

  forgotPassword: ({ email }) => api.post("/auth/forgot-password", { email }),

  resetPassword: ({ token, password }) => api.put(`/auth/reset-password/${token}`, { password }),
};
