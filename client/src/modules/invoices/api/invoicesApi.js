import api from "../../../utils/api";

export const invoicesApi = {
  getUsers: async () => {
    const { data } = await api.get("/users");
    return data;
  },

  getAllInvoices: async () => {
    const { data } = await api.get("/invoices/all");
    return data;
  },

  getPendingRequests: async () => {
    const { data } = await api.get("/expenses?status=pending");
    return data.expenses || [];
  },

  approveInvoice: (id) => api.put(`/invoices/${id}/approve`),
  rejectInvoice: ({ id, reason }) => api.put(`/invoices/${id}/reject`, { reason }),
  approveRequest: (id) => api.put(`/expenses/${id}/approve`),
  rejectRequest: ({ id, reason }) => api.put(`/expenses/${id}/reject`, { reason }),

  getMyInvoices: async () => {
    const { data } = await api.get("/invoices/my-invoices");
    return data;
  },

  getMyRequests: async (userId) => {
    const { data } = await api.get(`/expenses?createdBy=${userId}`);
    return data.expenses || [];
  },

  payInvoice: (invoiceId) => api.post(`/invoices/${invoiceId}/pay`),
  bulkPayInvoices: () => api.post("/invoices/bulk-pay"),
  deleteMyRequest: (requestId) => api.delete(`/expenses/${requestId}/my-request`),
};
