import api from "../../../utils/api";

export const dashboardApi = {
  getStats: async ({ user, userId }) => {
    if (!user) return null;
    const endpoint = user.role === "admin" ? "/stats/admin/dashboard" : `/stats/user/${userId}`;
    const { data } = await api.get(endpoint);
    return data;
  },
};
