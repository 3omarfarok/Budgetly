# Backend Logic (Budgetly)

This document describes the current backend behavior as implemented in the server code.

## Overview
- Runtime: Node.js + Express + MongoDB (Mongoose).
- Server entry: `server/server.js`.
- Middleware: CORS, JSON body parsing, rate limiter.
- Routes are mounted under `/api/*`.
- Mongo connection uses `MONGODB_URI` or defaults to `mongodb://localhost:27017/expense-tracker`.

## Middleware and Security
- `authenticate` reads `Authorization: Bearer <token>`, verifies JWT, loads the user from DB, checks `isActive`, and sets `req.user`.
- `isAdmin` checks `req.user.role === "admin"`.
- Rate limiting: 250 requests per 15 minutes per IP.

## Data Models

### User
- `username` (unique), `email` (optional, unique), `password`, `name`.
- `role`: `admin` or `user`.
- `isActive`, `profilePicture`.
- `house` reference.
- Password reset fields + `getResetPasswordToken` method.

### House
- `name` (unique), `houseId` (unique, optional), `admin`, `members`, `password`.
- `dishwashingRotation`: `{ enabled, startDate (YYYY-MM-DD), order[] }`.

### Expense
- `description`, `category`, `status` (`pending`, `approved`, `rejected`).
- `totalAmount`, `splitType` (`equal`, `specific`, `custom`).
- `splits[]` with `{ user, amount }`.
- `createdBy`, `paidBy` (optional), `generatedFromPayment` (optional).
- `house`, `date`.
- Pre-save validation ensures `splits` sum equals `totalAmount` (tolerance 0.01).

### Invoice
- `user`, `expense`, `amount`, `description`.
- `status`: `pending`, `awaiting_approval`, `paid`.
- `paymentRequest` reference (Payment).
- `house`, `dueDate`.

### Payment
- `user`, `amount`, `description`.
- `transactionType`: `payment` or `received` (default `payment`).
- `status`: `pending`, `approved`, `rejected`.
- `recordedBy`, `approvedBy`.
- `linkedExpense` (optional), `house`, `date`.

### Note
- `content`, `createdBy`, `house`, `date`.
- `replies[]` with `content`, `createdBy`, `createdAt`.

### ChatHistory
- `user`, `title`.
- `messages[]` with `role`, `content`, `timestamp`.

## Core Business Flows

### Expenses
- Create expense:
  - Split logic:
    - `equal`: split across all active users in the same house.
    - `specific`: split across `selectedUsers` equally.
    - `custom`: use `customSplits` as-is.
  - Status is `approved` if creator is admin, otherwise `pending`.
  - `createdBy` is always the requester; `paidBy` is the chosen payer (admin) or requester.
  - If approved immediately, invoices are generated for each split. The payer's invoice is marked `paid`, others `pending`.
- Approve expense (admin):
  - Sets expense status to `approved`.
  - Generates invoices for each split. Payer is `paidBy` (fallback `createdBy`).
- Reject expense (admin): sets status to `rejected`.
- Update expense (admin): only pending expenses can be updated; updates fields and recalculates splits.
- Delete expense (admin): deletes related invoices and any linked payment requests, then deletes the expense.
- Delete own pending request: only creator can delete, only if `pending`.

### Invoices and Payments
- Get invoices:
  - My invoices: filters by `user` and `house`, populates expense fields.
  - All invoices (admin): filters by `house`, populates user, expense, and paymentRequest.
- Pay invoice (user):
  - Requires invoice ownership, same house, and `status === "pending"`.
  - Creates a `Payment` with `status: pending` and links it in `invoice.paymentRequest`.
  - Sets invoice status to `awaiting_approval`.
- Approve invoice payment (admin):
  - Requires same house, invoice status `awaiting_approval`, and existing `paymentRequest`.
  - Sets payment status to `approved`, `approvedBy` to admin.
  - Sets invoice status to `paid`.
- Reject invoice payment (admin):
  - Requires same house and existing `paymentRequest`.
  - Sets payment status to `rejected` and appends reason to description.
  - Resets invoice status to `pending` and clears `paymentRequest`.
- Bulk pay invoices (user):
  - Finds all `pending` invoices for user in their house.
  - Creates individual payment requests and marks each invoice `awaiting_approval`.

### Stats and Balances
- Balance calculation uses:
- `externalPaid`: sum of approved expenses paid by the user (`paidBy`, fallback `createdBy`).
- `internalSent`: sum of approved payments where `user` is the payer.
- `invoicesAssigned`: sum of unpaid invoices for the user.
- `internalReceived`: sum of approved payments linked to invoices on expenses paid by the user.
  - `balance = externalPaid + internalSent - (invoicesAssigned + internalReceived)`.
- `getBalances`: returns balance per active user in house.
- `getUserStats`: includes recent invoices and category breakdown based on invoices.
- `getAdminDashboard`: aggregates totals for users, expenses, invoices, payments, plus category breakdown from invoices.

### Analytics
- Monthly analytics:
  - Expenses are grouped by month based on `expense.date` and the user's split amount.
  - Payments are derived from `paid` invoices (not from Payments collection).
  - Returns monthly totals, category breakdown, and summary stats.
- Category trends:
  - Looks back `months` (default 6) and aggregates expense splits by category per month.

### Houses
- Create house: creates new house, sets creator as admin, removes user from old house if needed.
- Join house: validates password, removes user from old house, adds to new house, sets role to `user`.
- Update name/houseId/password: admin-only checks and updates.
- Leave house: non-admins can leave; admin must transfer/delete instead.
- Remove member: admin-only, cannot remove admin.
- Delete house: admin-only; clears house from all users.
- Clear house data: admin-only; deletes expenses, invoices, payments by house.
- Export house data: admin-only; generates CSV for expenses or invoices.

### Users
- Get users: active users in the same house as the requester.
- Get user: fetch by ID (no house scoping).
- Create/update/deactivate users: admin-only.
- Self updates: profile picture, username, name, email.

### Notes
- Notes are scoped to the user’s house.
- Any member can create notes and replies.
- Delete note: admin or note creator.

### Dishwashing Rotation
- Rotation stored in `House.dishwashingRotation`.
- Uses Cairo timezone for date calculations.
- Admin can enable/disable and set rotation order.
- Returns today’s assignment and upcoming schedule.

### AI Assistant
- Uses Google Generative AI (Gemini) with a fixed system prompt.
- Persists chat history per user and provides list/detail/delete endpoints.

### Email Utility
- Uses SMTP or Gmail. If missing config, logs the email to console.

## API Routes (Current)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `PUT /api/auth/reset-password/:token`

### Users
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users` (admin)
- `PUT /api/users/:id` (admin)
- `DELETE /api/users/:id` (admin)
- `PATCH /api/users/me/profile-picture`
- `PATCH /api/users/me/username`
- `PATCH /api/users/me/name`
- `PATCH /api/users/me/profile`

### Houses
- `GET /api/houses`
- `GET /api/houses/:id`
- `POST /api/houses`
- `POST /api/houses/:id/join`
- `PATCH /api/houses/:id/name`
- `PATCH /api/houses/:id/houseId`
- `PATCH /api/houses/:id/password`
- `POST /api/houses/:id/leave`
- `DELETE /api/houses/:id/members/:memberId`
- `DELETE /api/houses/:id/clear-data`
- `GET /api/houses/:id/export/:type`
- `DELETE /api/houses/:id`

### Dishwashing (mounted under /api/houses)
- `GET /api/houses/:id/dishwashing`
- `PUT /api/houses/:id/dishwashing`
- `DELETE /api/houses/:id/dishwashing`
- `GET /api/houses/:id/dishwashing/today`
- `GET /api/houses/:id/dishwashing/schedule`

### Expenses
- `GET /api/expenses` (pagination + optional filters: `status`, `createdBy`)
- `POST /api/expenses`
- `PUT /api/expenses/:id` (admin)
- `PUT /api/expenses/:id/approve` (admin)
- `PUT /api/expenses/:id/reject` (admin)
- `DELETE /api/expenses/:id/my-request`
- `DELETE /api/expenses/:id` (admin)

### Invoices
- `GET /api/invoices/my-invoices`
- `GET /api/invoices/all` (admin)
- `POST /api/invoices/:id/pay`
- `POST /api/invoices/bulk-pay`
- `PUT /api/invoices/:id/approve` (admin)
- `PUT /api/invoices/:id/reject` (admin)

### Stats
- `GET /api/stats/balances`
- `GET /api/stats/user/:userId`
- `GET /api/stats/admin/dashboard`

### Analytics
- `GET /api/analytics/monthly`
- `GET /api/analytics/trends`

### Notes
- `GET /api/notes`
- `POST /api/notes`
- `POST /api/notes/:id/reply`
- `DELETE /api/notes/:id`

### AI
- `POST /api/ai/chat`
- `GET /api/ai/chats`
- `GET /api/ai/chats/:chatId`
- `DELETE /api/ai/chats/:chatId`

## Notes
- There is no dedicated `/api/payments` route mounted in the server; payments are created via invoice actions.
