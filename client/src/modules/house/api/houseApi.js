import api from "../../../utils/api";

export const houseApi = {
  getAvailableHouses: async () => {
    const { data } = await api.get("/houses");
    return data;
  },

  createHouse: (houseData) => api.post("/houses", houseData),

  joinHouse: ({ houseId, password }) => api.post(`/houses/${houseId}/join`, { password }),

  getCurrentUser: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  getHouseById: async (houseId) => {
    const { data } = await api.get(`/houses/${houseId}`);
    return data;
  },

  updateHouseName: ({ houseId, name }) => api.patch(`/houses/${houseId}/name`, { name }),

  updateHousePassword: ({ houseId, password }) =>
    api.patch(`/houses/${houseId}/password`, { password }),

  removeHouseMember: ({ houseId, memberId }) =>
    api.delete(`/houses/${houseId}/members/${memberId}`),

  leaveHouse: (houseId) => api.post(`/houses/${houseId}/leave`),

  deleteHouse: (houseId) => api.delete(`/houses/${houseId}`),

  clearHouseData: (houseId) => api.delete(`/houses/${houseId}/clear-data`),

  exportHouseData: ({ houseId, type }) =>
    api.get(`/houses/${houseId}/export/${type}`, { responseType: "blob" }),
};
