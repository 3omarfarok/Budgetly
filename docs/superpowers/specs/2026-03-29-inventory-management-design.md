# Inventory Management Design

## Goal

Add a simple, organized, house-scoped inventory feature to Budgetly for shared house supplies. The first version should let house members track stock, organize items by category, update quantities quickly, and see low-stock items from both the dedicated inventory page and the dashboard.

## Product Direction

- Inventory is a new first-class house tool, similar in weight to Notes and Dishwashing.
- Version 1 is intentionally independent from expenses and invoices.
- All authenticated users in the same house can view, add, edit, adjust, and delete inventory items.
- The UX should feel fast, polished, and mobile-friendly, matching Budgetly's current rounded card-based design language.
- The canonical user-facing feature name for v1 is `المخزون`.

## Scope

### In Scope

- Dedicated `Inventory` page in the main app navigation
- Dashboard low-stock preview card
- House-scoped inventory items
- Search and category filtering
- Add item flow
- Edit item flow
- Quick quantity adjustments
- Restock flow
- Low-stock and out-of-stock visual states

### Out of Scope

- Expense/invoice integration
- Purchase history
- Supplier tracking
- Barcode scanning
- Expiry dates
- Notifications beyond in-app low-stock visibility
- Per-user permissions beyond existing house membership rules

## Core User Stories

1. As a house member, I can create a supply item with a starting quantity and threshold.
2. As a house member, I can quickly increase or decrease stock from the main inventory view.
3. As a house member, I can see which items are low or out of stock without opening each item.
4. As a house member, I can search and filter items by category so the inventory stays organized.
5. As a user on the dashboard, I can see urgent low-stock items and jump into the full inventory page.

## Information Architecture

### Main Entry Points

- New route: `/inventory`
- New sidebar and navbar entry for `المخزون`
- New dashboard widget: low-stock summary with link to `/inventory`

### Existing Layout Fit

- Desktop navigation can accept a new `Inventory` item alongside the existing tools section in `Sidebar.jsx`
- Mobile navigation in `Navbar.jsx` currently uses a fixed 5-slot bottom bar, so inventory should not be forced into that row in v1
- For mobile, keep the 5-slot bottom bar unchanged and add a single compact `Inventory` shortcut inside `Navbar.jsx` near the existing mobile navigation controls; this keeps the change narrowly scoped to this feature
- Dashboard integration should follow the existing shared-widget pattern already used by the dishwashing widget in `DashboardPage.jsx`
- `DashboardPage.jsx` should render the reusable low-stock widget once for both roles, while `AdminDashboard.jsx` and `UserDashboard.jsx` remain focused on role-specific financial content

### Screen Structure

#### Inventory Page

- Page header with Arabic-first title, short helper text, and primary `إضافة صنف` action
- Summary cards:
  - Total Items
  - Low Stock
  - Out of Stock
  - Categories Count
- Filter row:
  - Search input
  - Category chips/dropdown
  - Required status filter: `الكل`, `متوفر`, `كمية قليلة`, `غير متوفر`
- Item grid/list:
  - Card per item
  - Item name
  - Category label
  - Current quantity + unit
  - Low-stock threshold
  - Status badge: `متوفر` / `كمية قليلة` / `غير متوفر`
  - Quick actions: `-1`, `+1`, `إعادة تعبئة`, `تعديل`, `حذف`

#### Dashboard Widget

- Compact card in dashboard module
- Shows top 4 low-stock or out-of-stock items
- Includes item name, current quantity, and status color
- Includes `عرض المخزون` CTA
- Render from `DashboardPage.jsx` as one shared widget for both admin and user flows

## Visual Design Direction

- Reuse Budgetly's existing rounded surfaces, soft shadows, and theme variables
- Use stronger semantic stock colors:
  - Healthy: green-tinted accent
  - Low stock: amber-tinted accent
  - Out of stock: red-tinted accent
- Prefer card layouts over tables for v1 to preserve mobile usability
- Keep interactions light and obvious with large tap targets for quantity adjustment
- The page should feel more structured than Notes, but less dense than Analytics

## Copy and Localization

- Inventory should follow the current Arabic-first product style used across the existing app
- Route names and internal code identifiers may remain English, but user-facing labels, helper text, status badges, empty states, and action text should be Arabic-first
- Suggested Arabic-facing labels:
  - `المخزون` for the feature name
  - `إضافة صنف`
  - `كمية قليلة`
  - `غير متوفر`
  - `متوفر`
- The implementation should keep wording simple and consistent with the current conversational app tone

## Data Model

Create a new collection instead of embedding inventory inside `House`, so the feature stays queryable and scalable.

### InventoryItem

- `house`: ObjectId -> `House` (required)
- `name`: string (required, trimmed)
- `category`: string (required, trimmed, limited to the predefined category identifiers for v1)
- `quantity`: number (required, min 0)
- `unit`: string (required, trimmed)
- `lowStockThreshold`: number (required, min 0)
- `createdBy`: ObjectId -> `User` (required)
- `updatedBy`: ObjectId -> `User` (required)
- timestamps

### Derived Status

Status should not be stored in MongoDB. It should be derived in controller/serializer logic:

- `out` when `quantity === 0`
- `low` when `quantity > 0 && quantity <= lowStockThreshold`
- `healthy` when `quantity > lowStockThreshold`

## Categories

Version 1 uses predefined category identifiers in storage and Arabic labels in the UI.

Canonical stored values:

- `cleaning`
- `kitchen`
- `bathroom`
- `laundry`
- `other`

Arabic display labels:

- `cleaning` -> `تنظيف`
- `kitchen` -> `المطبخ`
- `bathroom` -> `الحمام`
- `laundry` -> `الغسيل`
- `other` -> `أخرى`

Version 1 should use only these predefined categories to keep filters, labels, and search behavior consistent.

## API Design

Add a new Express route group under `/api/inventory`.

### Server File Structure

- `server/models/InventoryItem.js`
- `server/controllers/inventoryController.js`
- `server/routes/inventory.js`
- `server/server.js` route import and mount

### Endpoints

- `GET /api/inventory`
  - Returns all inventory items for the current user's house
  - Supports `search`, `category`, and `status` query params
- `GET /api/inventory/summary`
  - Returns aggregated counts for dashboard and page summary cards
- `POST /api/inventory`
  - Creates a new inventory item
- `PATCH /api/inventory/:id`
  - Updates editable fields like name, category, unit, threshold
- `PATCH /api/inventory/:id/adjust`
  - Adjusts quantity using an explicit operation payload
- `DELETE /api/inventory/:id`
  - Removes an item

### List Endpoint Contract

Accepted `status` query values:

- `healthy`
- `low`
- `out`

The frontend should map Arabic filter labels to these backend values:

- `الكل` -> omit `status`
- `متوفر` -> `healthy`
- `كمية قليلة` -> `low`
- `غير متوفر` -> `out`

Each returned item should include a derived `status` field in the response body so the UI does not need to recompute inventory state locally.

### Adjust Endpoint Contract

Request body:

- `action`: `increment` | `decrement` | `set`
- `amount`: number

Rules:

- `increment` adds `amount` to current quantity
- `decrement` subtracts `amount` from current quantity
- `set` replaces current quantity with `amount`
- `amount` must be a positive number for `increment` and `decrement`
- `amount` must be zero or greater for `set`

This keeps quick actions and modal restock flows on the same endpoint while avoiding ambiguous server behavior.

### Authorization Rules

- User must be authenticated
- User must belong to a house
- Item must belong to the same house as the current user
- All house members can perform inventory actions in v1

## Backend Behavior

### Listing Items

- Filter by `house = req.user.house`
- Apply search/category filtering server-side when provided
- Sort items in this exact order:
  - out-of-stock
  - low-stock
  - then healthy
  - within each group, `updatedAt` descending
  - then `name` ascending as final tie-breaker

### Creating Items

- Require valid house membership
- Validate `name`, `category`, `quantity`, `unit`, `lowStockThreshold`
- Save `createdBy` and `updatedBy` from current user

### Updating Items

- `PATCH /api/inventory/:id` updates editable metadata fields only: `name`, `category`, `unit`, `lowStockThreshold`
- `quantity` must not be edited through the metadata endpoint
- Every successful edit must also update `updatedBy`

### Adjusting Quantity

- Support simple quantity delta updates
- Prevent quantity from dropping below zero
- Return updated item with derived status
- Every successful quantity mutation must also update `updatedBy`

### Summary Endpoint

- Compute:
  - total items
  - low-stock items count
  - out-of-stock items count
  - number of categories currently in use
  - top 4 urgent items for dashboard preview

## Frontend Architecture

Create a new feature module following the existing app pattern.

### New Client Module

- `client/src/modules/inventory/index.js`
- `client/src/modules/inventory/pages/InventoryPage.jsx`
- `client/src/modules/inventory/pages/index.js`
- `client/src/modules/inventory/hooks/useInventory.js`
- `client/src/modules/inventory/hooks/index.js`
- `client/src/modules/inventory/api/inventoryApi.js`
- `client/src/modules/inventory/api/index.js`
- `client/src/modules/inventory/components/...`
- `client/src/modules/inventory/components/index.js`

Suggested components:

- `InventoryHeader`
- `InventorySummary`
- `InventoryFilters`
- `InventoryItemCard`
- `InventoryList`
- `AddInventoryItemModal` or form card
- `EditInventoryItemModal`
- `RestockInventoryModal`
- `LowStockWidget` for dashboard reuse

### Shared App Integration

- Add route in `client/src/app/router/routes.jsx`
- Add nav entry in `client/src/shared/components/Sidebar.jsx`
- Add mobile-only inventory access in `client/src/shared/components/Navbar.jsx`, without changing the existing desktop navigation ownership in `Sidebar.jsx`
- Add house-scoped query keys in `client/src/shared/api/queryKeys.js`, including `houseId` in list and summary keys
- Add dashboard widget component and render it from `DashboardPage.jsx`
- Add backend route import + mount in `server/server.js`

### Client Data Flow

- Page/components -> `useInventory` hook -> `inventoryApi` -> `client/src/utils/api.js`
- Use React Query for:
  - inventory list
  - inventory summary
  - create/update/delete/adjust mutations
- Inventory query keys must include `houseId` to match the house-scoped data model and avoid stale cache after house changes
- Invalidate list + summary queries after all mutations

## Interaction Design

### Add Item

- Launch from primary CTA
- Fields:
  - name
  - category
  - quantity
  - unit
  - low-stock threshold
- On success:
  - close form/modal
  - refresh list + summary
  - toast confirmation

### Edit Item

- Open from item card action
- Allow editing `name`, `category`, `unit`, and `lowStockThreshold`
- Quantity changes must happen through the adjust/restock flows only

### Quick Adjust

- `-1` lowers quantity by one if quantity is above zero
- `+1` raises quantity by one
- `إعادة تعبئة` opens a small focused flow for entering a larger amount
- The restock flow must call `PATCH /api/inventory/:id/adjust` with `action: "increment"`

### Empty States

- No items yet: encouraging empty state with CTA to add first item
- No filter results: friendly filtered-empty message with clear reset action

### Delete Safeguard

- Delete must not happen directly from a single tap on the card
- Tapping `Delete` opens the existing confirmation pattern used elsewhere in the app via `ConfirmModal`
- Confirmation copy should be Arabic-first and include the item name when practical
- On success, refresh list + summary and show a toast confirmation

## Edge Cases

- Users without a house must be blocked the same way as other house tools
- Quantity can never become negative
- Threshold can be zero
- If threshold is zero and quantity is zero -> out of stock
- If threshold is zero and quantity is above zero -> healthy
- Duplicate item names are allowed for v1 unless implementation discovers a UX issue; house teams may want similar items with different units

## Testing Strategy

### Backend

- Controller tests for:
  - create item
  - list items with house scoping
  - reject access across houses
  - adjust quantity without going below zero
  - summary calculations
  - delete item

### Frontend

- Component/hook tests where practical for:
  - filter behavior
  - status rendering
  - summary rendering
  - mutation success/error states

### Manual Verification

- Create multiple items across categories
- Search/filter combinations
- Quick adjust and restock flows
- Dashboard low-stock preview updates correctly
- Mobile layout remains usable

## Future Extensions

- Convert low-stock items into shopping-needed items
- Link restocking to expense creation
- Add activity history
- Add custom categories UI
- Add recurring reminders for essential supplies

## Implementation Notes

- Keep the first version card-based, not table-based
- Follow existing module boundaries in the client codebase
- Keep inventory independent from finance modules to reduce coupling
- Reuse existing toast, auth, route protection, and theme systems
