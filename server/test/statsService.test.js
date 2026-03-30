import test from "node:test";
import assert from "node:assert/strict";

import { buildHouseBalanceSnapshot } from "../services/statsService.js";

test("buildHouseBalanceSnapshot computes balances from house records in one pass", () => {
  const houseId = "house-1";
  const userA = "user-a";
  const userB = "user-b";

  const snapshot = buildHouseBalanceSnapshot({
    houseId,
    users: [
      { _id: userA, name: "Alice", username: "alice" },
      { _id: userB, name: "Bob", username: "bob" },
    ],
    expenses: [
      {
        _id: "expense-1",
        house: houseId,
        status: "approved",
        totalAmount: 100,
        createdBy: userA,
        paidBy: userA,
      },
    ],
    invoices: [
      {
        _id: "invoice-1",
        house: houseId,
        user: userA,
        expense: "expense-1",
        amount: 50,
        status: "paid",
      },
      {
        _id: "invoice-2",
        house: houseId,
        user: userB,
        expense: "expense-1",
        amount: 50,
        status: "pending",
        paymentRequest: "payment-1",
      },
    ],
    payments: [
      {
        _id: "payment-1",
        house: houseId,
        user: userB,
        amount: 50,
        status: "approved",
        transactionType: "payment",
      },
    ],
  });

  assert.deepEqual(snapshot.balancesByUserId[userA], {
    externalPaid: 100,
    internalSent: 0,
    invoicesAssigned: 0,
    internalReceived: 50,
    balance: 50,
  });

  assert.deepEqual(snapshot.balancesByUserId[userB], {
    externalPaid: 0,
    internalSent: 50,
    invoicesAssigned: 50,
    internalReceived: 0,
    balance: 0,
  });
});
