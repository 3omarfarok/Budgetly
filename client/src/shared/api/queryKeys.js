export const queryKeys = {
  houses: {
    all: ["houses"],
  },
  users: {
    all: ["users"],
    current: ["user"],
  },
  expenses: {
    all: ["expenses"],
    list: (page, selectedUserId) => ["expenses", page, selectedUserId],
    pendingRequests: ["pendingRequests"],
  },
  myPayments: {
    all: ["myPayments"],
  },
  income: {
    allPayments: ["allPaymentsForIncome"],
  },
  budgets: {
    all: ["budgets"],
  },
  myInvoices: {
    all: ["myInvoices"],
    byUser: (userId) => ["myInvoices", userId],
  },
  myRequests: {
    all: ["myRequests"],
    byUser: (userId) => ["myRequests", userId],
  },
  allInvoices: {
    all: ["allInvoices"],
  },
  profileStats: {
    byUser: (userId) => ["profileStats", userId],
  },
  dashboardStats: {
    byUserRole: (userId, role) => ["dashboardStats", userId, role],
  },
  ai: {
    chats: ["aiChats"],
    chat: (chatId) => ["aiChat", chatId],
  },
  dishwashing: {
    all: (houseId) => ["dishwashing", houseId],
    settings: (houseId) => ["dishwashing", houseId, "settings"],
    today: (houseId) => ["dishwashing", houseId, "today"],
    schedule: (houseId) => ["dishwashing", houseId, "schedule"],
  },
  house: {
    byId: (houseId) => ["house", houseId],
  },
  notes: {
    all: ["notes"],
  },
  analytics: {
    all: ["analytics"],
  },
};
