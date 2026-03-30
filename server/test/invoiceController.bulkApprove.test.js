import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import { approveAllUserInvoices } from "../controllers/invoiceController.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

const originalInvoiceFind = Invoice.find;
const originalPaymentFindById = Payment.findById;
const originalUserFindById = User.findById;

const createRes = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return res;
};

const objectId = () => new mongoose.Types.ObjectId();

const createInvoice = ({
  user = objectId(),
  house = objectId(),
  status = "awaiting_approval",
  paymentRequest = objectId(),
} = {}) => ({
  _id: objectId(),
  user,
  house,
  status,
  paymentRequest,
  saveCalls: 0,
  async save() {
    this.saveCalls += 1;
  },
});

const createPayment = ({ status = "pending", approvedBy = null } = {}) => ({
  _id: objectId(),
  status,
  approvedBy,
  saveCalls: 0,
  async save() {
    this.saveCalls += 1;
  },
});

test.afterEach(() => {
  Invoice.find = originalInvoiceFind;
  Payment.findById = originalPaymentFindById;
  User.findById = originalUserFindById;
});

test("approveAllUserInvoices approves all eligible invoices for the selected user", async () => {
  const houseId = objectId();
  const selectedUserId = objectId();
  const adminId = objectId();
  const eligiblePaymentA = createPayment();
  const eligiblePaymentB = createPayment();
  const eligibleInvoiceA = createInvoice({
    user: selectedUserId,
    house: houseId,
    paymentRequest: eligiblePaymentA._id,
  });
  const eligibleInvoiceB = createInvoice({
    user: selectedUserId,
    house: houseId,
    paymentRequest: eligiblePaymentB._id,
  });
  const ignoredPaidInvoice = createInvoice({
    user: selectedUserId,
    house: houseId,
    status: "paid",
    paymentRequest: objectId(),
  });
  const ignoredMissingRequestInvoice = createInvoice({
    user: selectedUserId,
    house: houseId,
    paymentRequest: null,
  });

  User.findById = async (id) => {
    assert.equal(id.toString(), selectedUserId.toString());
    return { _id: selectedUserId, house: houseId };
  };

  Invoice.find = async (query) => {
    assert.equal(query.user.toString(), selectedUserId.toString());
    assert.equal(query.house.toString(), houseId.toString());
    assert.equal(query.status, "awaiting_approval");
    assert.deepEqual(query.paymentRequest, { $ne: null });
    return [eligibleInvoiceA, eligibleInvoiceB];
  };

  Payment.findById = async (id) => {
    if (id.toString() === eligiblePaymentA._id.toString()) return eligiblePaymentA;
    if (id.toString() === eligiblePaymentB._id.toString()) return eligiblePaymentB;
    return null;
  };

  const req = {
    params: { userId: selectedUserId.toString() },
    user: { id: adminId.toString(), house: houseId },
  };
  const res = createRes();

  await approveAllUserInvoices(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.count, 2);
  assert.match(res.body.message, /2/);

  assert.equal(eligiblePaymentA.status, "approved");
  assert.equal(eligiblePaymentB.status, "approved");
  assert.equal(eligiblePaymentA.approvedBy.toString(), adminId.toString());
  assert.equal(eligiblePaymentB.approvedBy.toString(), adminId.toString());
  assert.equal(eligiblePaymentA.saveCalls, 1);
  assert.equal(eligiblePaymentB.saveCalls, 1);

  assert.equal(eligibleInvoiceA.status, "paid");
  assert.equal(eligibleInvoiceB.status, "paid");
  assert.equal(eligibleInvoiceA.paymentRequest.toString(), eligiblePaymentA._id.toString());
  assert.equal(eligibleInvoiceB.paymentRequest.toString(), eligiblePaymentB._id.toString());
  assert.equal(eligibleInvoiceA.saveCalls, 1);
  assert.equal(eligibleInvoiceB.saveCalls, 1);

  assert.equal(ignoredPaidInvoice.status, "paid");
  assert.equal(ignoredMissingRequestInvoice.paymentRequest, null);
});

test("approveAllUserInvoices returns 400 when admin has no house", async () => {
  const req = {
    params: { userId: objectId().toString() },
    user: { id: objectId().toString(), house: null },
  };
  const res = createRes();

  await approveAllUserInvoices(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "User not in a house");
});

test("approveAllUserInvoices returns 400 when userId is malformed", async () => {
  const req = {
    params: { userId: "bad-id" },
    user: { id: objectId().toString(), house: objectId() },
  };
  const res = createRes();

  await approveAllUserInvoices(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Invalid user id");
});

test("approveAllUserInvoices returns 404 when the target user does not exist", async () => {
  User.findById = async () => null;

  const req = {
    params: { userId: objectId().toString() },
    user: { id: objectId().toString(), house: objectId() },
  };
  const res = createRes();

  await approveAllUserInvoices(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "User not found");
});

test("approveAllUserInvoices returns 403 when the target user is outside the admin house", async () => {
  User.findById = async () => ({ _id: objectId(), house: objectId() });

  const req = {
    params: { userId: objectId().toString() },
    user: { id: objectId().toString(), house: objectId() },
  };
  const res = createRes();

  await approveAllUserInvoices(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, "Not authorized to approve invoices for this user");
});

test("approveAllUserInvoices returns 400 when the selected user has no eligible invoices", async () => {
  const houseId = objectId();

  User.findById = async () => ({ _id: objectId(), house: houseId });
  Invoice.find = async () => [];

  const req = {
    params: { userId: objectId().toString() },
    user: { id: objectId().toString(), house: houseId },
  };
  const res = createRes();

  await approveAllUserInvoices(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "No eligible invoices found");
});

test("approveAllUserInvoices returns 404 when a linked payment is missing and leaves invoices unchanged", async () => {
  const houseId = objectId();
  const selectedUserId = objectId();
  const missingPaymentId = objectId();
  const invoice = createInvoice({
    user: selectedUserId,
    house: houseId,
    paymentRequest: missingPaymentId,
  });

  User.findById = async () => ({ _id: selectedUserId, house: houseId });
  Invoice.find = async () => [invoice];
  Payment.findById = async () => null;

  const req = {
    params: { userId: selectedUserId.toString() },
    user: { id: objectId().toString(), house: houseId },
  };
  const res = createRes();

  await approveAllUserInvoices(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "Payment not found");
  assert.equal(invoice.status, "awaiting_approval");
  assert.equal(invoice.saveCalls, 0);
});
