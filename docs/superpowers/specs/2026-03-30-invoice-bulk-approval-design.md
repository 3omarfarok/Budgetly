# Invoice Bulk Approval Design

## Goal

Add a simple admin action to approve all invoices that are currently waiting for approval for the selected user on the admin invoices page.

## Product Direction

- This is a small enhancement to the existing invoice approval flow.
- The feature is only for house admins.
- The action applies only to the currently selected user in `AllInvoicesPage.jsx`.
- The feature should reuse the current approval behavior and page patterns instead of introducing a new workflow.

## Scope

### In Scope

- Add a bulk approve button in the selected-user invoice panel
- Approve only invoices with status `awaiting_approval`
- Restrict approvals to invoices belonging to the selected user in the current admin's house
- Reuse existing query invalidation and toast behavior patterns after success

### Out of Scope

- Bulk reject
- Global house-wide approve-all action
- Changes to the user bulk payment flow
- New permissions or role behavior
- Table-level generic bulk action infrastructure

## User Story

1. As a house admin, when I open a specific user's invoice list, I can approve all of that user's waiting invoices with one action instead of approving each invoice one by one.

## Existing Flow Fit

- `client/src/modules/invoices/pages/AllInvoicesPage.jsx` already shows a selected-user panel with that user's invoices.
- `client/src/modules/invoices/components/InvoicesTable.jsx` already supports per-invoice approve and reject actions for `awaiting_approval` invoices.
- `server/controllers/invoiceController.js` already contains the single-invoice approval rules that set the related payment to `approved`, set `approvedBy`, and mark the invoice as `paid`.
- The new feature should extend this flow, not replace it.

## UX Design

### Placement

- Show the new button inside the selected-user panel in `AllInvoicesPage.jsx`, near the panel heading and above the invoices table.
- The button appears only when a user is selected and that user has at least one eligible invoice.
- For this feature, an eligible invoice is one where:
  - `status === "awaiting_approval"`
  - `paymentRequest` exists

### Button Behavior

- Suggested label: `موافقة على الكل (N)` where `N` is the count of waiting invoices for the selected user.
- On click, show a confirmation dialog before sending the request.
- During submission, disable the button to prevent duplicate requests.

### Success and Empty States

- On success, show one success toast summarizing the bulk action.
- If there are no waiting invoices, the button should not be shown.
- If the backend receives the request but finds no matching waiting invoices, it should return a clear error message and the frontend should show one error toast.

## Backend Design

Add one admin-only endpoint for bulk approval.

The bulk controller should mirror the same approval invariants as `approveInvoicePayment`, but apply them across the selected user's eligible invoices.

### Endpoint

- `PUT /api/invoices/users/:userId/approve-all`

### Request Rules

- The caller must be an authenticated admin.
- If `req.user.house` is missing, return `400`, matching the existing invoice-controller guard style.
- Validate `:userId` format before querying. If it is malformed, return `400` instead of falling through to a generic server error.
- Validate the target user before querying invoices:
  - if the target user does not exist, return `404`
  - if the target user is not in the same house as the admin, return `403`
- Only invoices that match all of the following are included:
  - `user === :userId`
  - `house === req.user.house`
  - `status === "awaiting_approval"`
  - `paymentRequest` exists

### Processing Rules

Before performing any writes:

- Collect all matching invoices first
- Verify that each matching invoice's `paymentRequest` points to an existing `Payment` document
- If any linked payment is missing, stop without applying any updates

For each matching invoice:

- Load the linked payment record
- Set payment `status` to `approved`
- Set payment `approvedBy` to the current admin id
- Set invoice `status` to `paid`
- Preserve the existing `paymentRequest` reference on the invoice, matching the current single-invoice approval behavior

This bulk operation should fully prevalidate the selected user's eligible invoices before any writes begin. The implementation does not need to introduce Mongo transactions for this feature, but it must avoid silently skipping broken records.

### Response Shape

Return a small success payload with:

- `message`
- `count`

The response does not need to include all updated invoices for this feature.

## Frontend Design

### API Layer

- Add one client API helper in `client/src/modules/invoices/api/invoicesApi.js` for the new endpoint.
- The helper should return `response.data` so the mutation can use the returned `count` or `message` if needed.

### Hook Layer

- Add one React Query mutation in `client/src/modules/invoices/hooks/useAllInvoices.js`.
- On success, invalidate `queryKeys.allInvoices.all` and `queryKeys.users.all`, matching the existing single-approve flow.
- Reuse the existing confirmation-first interaction pattern used by `handleApprove` and `handleApproveRequest`.
- The success toast may use either a fixed Arabic message or the backend response payload, but it should remain a single summary toast for the whole action.
- On error, toast `err.response?.data?.message` with a fixed Arabic fallback so backend validation messages are visible to the admin.

### Page Layer

- Compute the selected user's eligible invoice count in `AllInvoicesPage.jsx` or expose it from `useAllInvoices()` if that keeps the page cleaner.
- Render the bulk approve button only when the count is greater than zero.
- Keep the existing per-row approve/reject actions unchanged.

## Error Handling

- Return `400` when there are no matching waiting invoices to approve.
- Return `403` if the admin tries to approve invoices outside their house.
- Return `404` if the target user does not exist.
- If any linked payment record is missing, fail the request without applying partial updates. To stay aligned with the existing single-invoice approval semantics, return `404` for the missing payment condition.

## Routing Note

- The new route is intentionally a user-scoped collection action, similar in spirit to the existing `/bulk-pay` collection action.
- Add it as a narrow invoices-module enhancement without introducing reusable bulk-action abstractions or broader route restructuring.

## Testing Strategy

- Preferred: add a focused backend test covering the bulk-approve controller behavior.
- Minimum behavior to verify:
  - only selected-user waiting invoices are approved
  - invoices in other statuses are ignored
  - linked payments are marked `approved` with `approvedBy` set
  - invoices outside the admin's house are rejected
  - zero matching invoices returns a clear error
- If the current server test harness makes this impractical without unrelated setup work, keep the implementation narrow and verify with targeted app checks and manual validation before completion.

## Implementation Notes

- Keep the change minimal and localized to the invoices module.
- Do not add generic bulk-action abstractions unless the current code clearly needs them.
- Preserve the existing Arabic-first UI tone and current admin invoice page design language.
