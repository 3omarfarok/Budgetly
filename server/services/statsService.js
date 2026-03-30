import Expense from "../models/Expense.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";

const toIdString = (value) => {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.toString();
};

const createEmptyBalance = () => ({
  externalPaid: 0,
  internalSent: 0,
  invoicesAssigned: 0,
  internalReceived: 0,
  balance: 0,
});

const ensureUserBalance = (balancesByUserId, userId) => {
  const normalizedUserId = toIdString(userId);

  if (!normalizedUserId) {
    return null;
  }

  if (!balancesByUserId[normalizedUserId]) {
    balancesByUserId[normalizedUserId] = createEmptyBalance();
  }

  return balancesByUserId[normalizedUserId];
};

export const buildHouseBalanceSnapshot = ({ users, expenses, invoices, payments }) => {
  const balancesByUserId = Object.create(null);
  const approvedExpensePayerById = new Map();
  const approvedPaymentAmountById = new Map();
  const receivedPaymentsByPayerId = new Map();

  for (const user of users) {
    ensureUserBalance(balancesByUserId, user._id);
  }

  for (const payment of payments) {
    if (payment.status !== "approved" || payment.transactionType !== "payment") {
      continue;
    }

    const userBalance = ensureUserBalance(balancesByUserId, payment.user);
    if (userBalance) {
      userBalance.internalSent += payment.amount;
    }

    approvedPaymentAmountById.set(toIdString(payment._id), payment.amount);
  }

  for (const expense of expenses) {
    if (expense.status !== "approved") {
      continue;
    }

    const payerId = toIdString(expense.paidBy || expense.createdBy);
    approvedExpensePayerById.set(toIdString(expense._id), payerId);

    const payerBalance = ensureUserBalance(balancesByUserId, payerId);
    if (payerBalance) {
      payerBalance.externalPaid += expense.totalAmount;
    }
  }

  for (const invoice of invoices) {
    const userBalance = ensureUserBalance(balancesByUserId, invoice.user);
    if (userBalance && invoice.status !== "paid") {
      userBalance.invoicesAssigned += invoice.amount;
    }

    if (!invoice.paymentRequest) {
      continue;
    }

    const payerId = approvedExpensePayerById.get(toIdString(invoice.expense));
    const paymentRequestId = toIdString(invoice.paymentRequest);
    const approvedPaymentAmount = approvedPaymentAmountById.get(paymentRequestId);

    if (!payerId || approvedPaymentAmount == null) {
      continue;
    }

    let seenPaymentIds = receivedPaymentsByPayerId.get(payerId);
    if (!seenPaymentIds) {
      seenPaymentIds = new Set();
      receivedPaymentsByPayerId.set(payerId, seenPaymentIds);
    }

    if (seenPaymentIds.has(paymentRequestId)) {
      continue;
    }

    seenPaymentIds.add(paymentRequestId);
    const payerBalance = ensureUserBalance(balancesByUserId, payerId);
    if (payerBalance) {
      payerBalance.internalReceived += approvedPaymentAmount;
    }
  }

  for (const balance of Object.values(balancesByUserId)) {
    balance.balance =
      balance.externalPaid +
      balance.internalSent -
      (balance.invoicesAssigned + balance.internalReceived);
  }

  return {
    balancesByUserId,
    approvedExpensePayerById,
    approvedPaymentAmountById,
  };
};

export const getHouseStatsSnapshot = async (houseId) => {
  const [users, expenses, invoices, payments] = await Promise.all([
    User.find({ isActive: true, house: houseId })
      .select("name username house")
      .lean(),
    Expense.find({ house: houseId })
      .select("totalAmount status paidBy createdBy category house")
      .lean(),
    Invoice.find({ house: houseId })
      .select("user expense amount status paymentRequest createdAt")
      .lean(),
    Payment.find({ house: houseId })
      .select("user amount status transactionType createdAt")
      .lean(),
  ]);

  return {
    users,
    expenses,
    invoices,
    payments,
    ...buildHouseBalanceSnapshot({ users, expenses, invoices, payments }),
  };
};
