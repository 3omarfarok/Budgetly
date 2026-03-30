# Invoice Bulk Approval Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin-only `Approve All` action that approves the currently selected user's eligible waiting invoices from the admin invoices page.

**Architecture:** Extend the existing invoices module instead of introducing generic bulk-action infrastructure. Add one user-scoped bulk-approve endpoint on the server, wire it into the existing invoices API/hook layer, and render a single button in the selected-user panel on `AllInvoicesPage.jsx` when that user has eligible invoices.

**Tech Stack:** Express 5, Mongoose, Node test runner, React 19, React Query, Axios, Tailwind CSS 4

---

## Pre-Work Notes

- The approved design spec is `docs/superpowers/specs/2026-03-30-invoice-bulk-approval-design.md`.
- Keep the change narrow to the invoices module. Do not add bulk reject or global house-wide approval.
- Backend tests can run with `npm test` in `server` (`node --test`).
- The client does not have a dedicated component test harness configured, so frontend verification should use:
  - `npm run lint` in `client`
  - `npm run build` in `client`
  - manual admin-flow verification in local dev
- Do not create commits unless the user explicitly asks.

## File Map

- Modify: `server/controllers/invoiceController.js`
  Responsibility: add the bulk-approve controller and keep its approval rules aligned with `approveInvoicePayment`.
- Modify: `server/routes/invoices.js`
  Responsibility: expose the new admin-only bulk-approve endpoint.
- Create: `server/test/invoiceController.bulkApprove.test.js`
  Responsibility: cover the new controller's request guards and approval behavior with focused backend tests.
- Modify: `client/src/modules/invoices/api/invoicesApi.js`
  Responsibility: add a client helper for the new bulk-approve endpoint that returns `response.data`.
- Modify: `client/src/modules/invoices/hooks/useAllInvoices.js`
  Responsibility: add the bulk-approve mutation, query invalidation, confirmation flow, and error toast behavior.
- Modify: `client/src/modules/invoices/pages/AllInvoicesPage.jsx`
  Responsibility: compute the selected user's eligible invoice count and render the `Approve All` button in the selected-user panel.

### Task 1: Add The Backend Bulk-Approve Test First

**Files:**
- Create: `server/test/invoiceController.bulkApprove.test.js`
- Read for reference: `server/controllers/invoiceController.js`
- Read for reference: `server/test/statsService.test.js`

- [ ] **Step 1: Write the failing test for the happy path**

```js
test("approveAllUserInvoices approves all eligible invoices for the selected user", async () => {
  // Mock User.findById, Invoice.find, Payment.findById and invoice/payment save methods
  // Build tiny req/res helpers with node:test + node:assert
  // Assert count/message plus payment/invoice state transitions
});
```

- [ ] **Step 2: Run the test to verify it fails for the expected reason**

Run: `npm test -- invoiceController.bulkApprove.test.js`
Workdir: `server`
Expected: FAIL because the bulk-approve controller does not exist yet, or the route logic is still missing.

- [ ] **Step 3: Add the first set of failing guard tests before implementation**

```js
test("approveAllUserInvoices returns 400 when admin has no house", async () => {});
test("approveAllUserInvoices returns 400 when userId is malformed", async () => {});
test("approveAllUserInvoices returns 404 when the target user does not exist", async () => {});
test("approveAllUserInvoices returns 403 when the target user is outside the admin house", async () => {});
```

- [ ] **Step 4: Run the focused backend test file again**

Run: `npm test -- invoiceController.bulkApprove.test.js`
Workdir: `server`
Expected: FAIL with missing-controller or incorrect-behavior failures, not syntax errors.

### Task 2: Implement The Backend Bulk-Approve Controller And Route

**Files:**
- Modify: `server/controllers/invoiceController.js`
- Modify: `server/routes/invoices.js`
- Test: `server/test/invoiceController.bulkApprove.test.js`

- [ ] **Step 1: Export the new controller in `server/controllers/invoiceController.js`**

```js
export const approveAllUserInvoices = async (req, res) => {
  // implementation filled in by the next steps
};
```

- [ ] **Step 2: Add request validation at the top of the controller**

```js
if (!req.user.house) {
  return res.status(400).json({ message: "User not in a house" });
}

if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
  return res.status(400).json({ message: "Invalid user id" });
}
```

- [ ] **Step 3: Verify the target user exists and belongs to the admin's house**

```js
const targetUser = await User.findById(req.params.userId);
if (!targetUser) {
  return res.status(404).json({ message: "User not found" });
}

if (!targetUser.house || targetUser.house.toString() !== req.user.house.toString()) {
  return res.status(403).json({ message: "Not authorized to approve invoices for this user" });
}
```

- [ ] **Step 4: Load eligible invoices and reject the empty case**

```js
const invoices = await Invoice.find({
  user: req.params.userId,
  house: req.user.house,
  status: "awaiting_approval",
  paymentRequest: { $ne: null },
});

if (invoices.length === 0) {
  return res.status(400).json({ message: "No eligible invoices found" });
}
```

- [ ] **Step 5: Prevalidate linked payments before writing anything**

```js
const payments = await Promise.all(
  invoices.map((invoice) => Payment.findById(invoice.paymentRequest)),
);

if (payments.some((payment) => !payment)) {
  return res.status(404).json({ message: "Payment not found" });
}
```

- [ ] **Step 6: Apply the approval updates using the existing single-approve invariants**

```js
for (const [index, invoice] of invoices.entries()) {
  const payment = payments[index];
  payment.status = "approved";
  payment.approvedBy = req.user.id;
  await payment.save();

  invoice.status = "paid";
  await invoice.save();
}
```

Implementation details to preserve:
- eligible invoice means `status === "awaiting_approval"` and `paymentRequest` exists
- keep `invoice.paymentRequest` unchanged on success
- return `404` if the target user does not exist
- return `403` if the target user is outside the admin's house
- return `400` if there are zero eligible invoices
- return `404` if any referenced payment record is missing

- [ ] **Step 7: Return the response payload and wire the route**

```js
res.json({
  message: `Approved ${invoices.length} invoices successfully`,
  count: invoices.length,
});
```

```js
router.put("/users/:userId/approve-all", authenticate, isAdmin, approveAllUserInvoices);
```

- [ ] **Step 8: Run the backend tests to verify the happy path and guard tests pass**

Run: `npm test -- invoiceController.bulkApprove.test.js`
Workdir: `server`
Expected: PASS

- [ ] **Step 9: Add the remaining failing regression tests**

```js
test("approveAllUserInvoices returns 400 when the selected user has no eligible invoices", async () => {});
test("approveAllUserInvoices returns 404 when a linked payment is missing and leaves invoices unchanged", async () => {});
```

- [ ] **Step 10: Expand the happy-path assertions to prove only eligible invoices are approved**

Add assertions that:
- invoices in `awaiting_approval` with a `paymentRequest` become `paid`
- invoices in other statuses remain unchanged
- invoices without `paymentRequest` remain unchanged
- only the linked payments for eligible invoices become `approved`

- [ ] **Step 11: Run the focused backend test file again**

Run: `npm test -- invoiceController.bulkApprove.test.js`
Workdir: `server`
Expected: PASS

### Task 3: Add The Client API And Hook Support

**Files:**
- Modify: `client/src/modules/invoices/api/invoicesApi.js`
- Modify: `client/src/modules/invoices/hooks/useAllInvoices.js`

- [ ] **Step 1: Add the API helper in `invoicesApi.js`**

```js
approveAllUserInvoices: async (userId) => {
  const { data } = await api.put(`/invoices/users/${userId}/approve-all`);
  return data;
},
```

- [ ] **Step 2: Add the new mutation in `useAllInvoices.js`**

```js
const approveAllUserInvoicesMutation = useMutation({
  mutationFn: invoicesApi.approveAllUserInvoices,
  onSuccess: (data) => {
    toast.success(data?.message || "تمت الموافقة على جميع الفواتير");
    queryClient.invalidateQueries({ queryKey: queryKeys.allInvoices.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  },
  onError: (err) => {
    toast.error(err.response?.data?.message || "فشل الموافقة على جميع الفواتير");
  },
});
```

- [ ] **Step 3: Add a confirmation-based handler that matches the current page behavior**

```js
const handleApproveAllUserInvoices = (userId, count) => {
  if (!window.confirm(`هل أنت متأكد من الموافقة على ${count} فواتير دفعة واحدة؟`)) return;
  approveAllUserInvoicesMutation.mutate(userId);
};
```

- [ ] **Step 4: Return the new mutation state and handler from the hook**

```js
return {
  // existing values...
  handleApproveAllUserInvoices,
  isApprovingAllUserInvoices: approveAllUserInvoicesMutation.isPending,
};
```

- [ ] **Step 5: Run the existing frontend lint check after the hook/API changes**

Run: `npm run lint`
Workdir: `client`
Expected: PASS

### Task 4: Render The Selected-User Bulk Approve Button

**Files:**
- Modify: `client/src/modules/invoices/pages/AllInvoicesPage.jsx`
- Read for reference: `client/src/modules/invoices/components/InvoicesTable.jsx`

- [ ] **Step 1: Read the new hook values in `AllInvoicesPage.jsx`**

```js
const {
  // existing values...
  handleApproveAllUserInvoices,
  isApprovingAllUserInvoices,
} = useAllInvoices();
```

- [ ] **Step 2: Compute the selected user's eligible invoice count in the page**

```js
const selectedUserEligibleInvoicesCount = selectedUserInvoices.filter(
  (invoice) => invoice.status === "awaiting_approval" && invoice.paymentRequest,
).length;
```

- [ ] **Step 3: Render the button in the selected-user panel only when the count is greater than zero**

```jsx
{selectedUserEligibleInvoicesCount > 0 && (
  <button
    onClick={() => handleApproveAllUserInvoices(selectedUser._id, selectedUserEligibleInvoicesCount)}
    disabled={isApprovingAllUserInvoices}
    className="..."
  >
    {isApprovingAllUserInvoices
      ? "جاري الموافقة..."
      : `موافقة على الكل (${selectedUserEligibleInvoicesCount})`}
  </button>
)}
```

- [ ] **Step 4: Keep the existing per-row approve/reject actions unchanged**

Check:
- do not modify `InvoicesTable.jsx` action behavior
- do not add table-level selection UI
- do not change the global “All Invoices” section layout beyond what is needed for the selected-user panel header/actions

- [ ] **Step 5: Run frontend verification**

Run: `npm run lint`
Workdir: `client`
Expected: PASS

Run: `npm run build`
Workdir: `client`
Expected: PASS

### Task 5: Final Verification

**Files:**
- Verify: `server/controllers/invoiceController.js`
- Verify: `server/routes/invoices.js`
- Verify: `server/test/invoiceController.bulkApprove.test.js`
- Verify: `client/src/modules/invoices/api/invoicesApi.js`
- Verify: `client/src/modules/invoices/hooks/useAllInvoices.js`
- Verify: `client/src/modules/invoices/pages/AllInvoicesPage.jsx`

- [ ] **Step 1: Run the focused backend tests one final time**

Run: `npm test -- invoiceController.bulkApprove.test.js`
Workdir: `server`
Expected: PASS

- [ ] **Step 2: Run the client checks one final time**

Run: `npm run lint`
Workdir: `client`
Expected: PASS

Run: `npm run build`
Workdir: `client`
Expected: PASS

- [ ] **Step 3: Manually verify the admin flow in local dev**

Manual checklist:
- log in as a house admin
- open `إدارة الفواتير`
- select a user with eligible invoices
- confirm the bulk-approve button appears with the correct count
- click the button and accept the confirmation dialog
- verify the success toast appears once
- verify the selected user's waiting invoices move from `awaiting_approval` to `paid`
- verify users with no eligible invoices do not show the button

- [ ] **Step 4: Review the working tree before any optional commit**

Run: `git status --short`
Expected: only the intended invoice bulk-approval files are changed, plus any unrelated pre-existing user changes left untouched.
