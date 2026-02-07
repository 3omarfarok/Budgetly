import api from "../../../utils/api";

export const expensesApi = {
  getUsers: async () => {
    const { data } = await api.get("/users");
    return data;
  },

  getExpenses: async ({ page, limit = 10, createdBy }) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    if (createdBy) params.append("createdBy", createdBy);

    const { data } = await api.get(`/expenses?${params.toString()}`);
    return data;
  },

  createExpense: (payload) => api.post("/expenses", payload),

  deleteExpense: (id) => api.delete(`/expenses/${id}`),
};
