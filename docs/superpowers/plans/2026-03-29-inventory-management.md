# Inventory Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a house-scoped `المخزون` feature with organized categories, quick quantity updates, low-stock visibility, and dashboard integration.

**Architecture:** Add a new `InventoryItem` Mongo model plus Express routes/controllers on the server, then build a feature-module React UI under `client/src/modules/inventory` that uses React Query and the existing Axios client. Keep inventory independent from expenses, scoped to the active house, and integrated into the existing sidebar/navbar/dashboard patterns.

**Tech Stack:** Express 5, Mongoose, React 19, React Router, React Query, Axios, Tailwind CSS 4, Lucide React

---

## Pre-Work Notes

- The approved design spec is `docs/superpowers/specs/2026-03-29-inventory-management-design.md`.
- This repo currently has no automated frontend/backend test harness (`vitest`, `jest`, route tests) configured.
- For this feature, verification should rely on:
  - targeted syntax checks for new server files
  - `npm run lint` in `client`
  - `npm run build` in `client`
  - manual API/UI verification in local dev
- The approved spec mentions automated tests where practical. In this repo, there is no existing test harness, so this implementation plan explicitly defers test-harness setup and uses syntax/lint/build/manual verification instead.
- Do not introduce expense/invoice coupling in v1.
- Do not create commits unless the user explicitly asks.

### Task 1: Add The Backend Inventory Model And Routes

**Files:**
- Create: `server/models/InventoryItem.js`
- Create: `server/controllers/inventoryController.js`
- Create: `server/routes/inventory.js`
- Modify: `server/server.js`

- [ ] **Step 1: Create the Mongoose model**

```js
import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
  {
    house: { type: mongoose.Schema.Types.ObjectId, ref: "House", required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["cleaning", "kitchen", "bathroom", "laundry", "other"],
    },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true, trim: true },
    lowStockThreshold: { type: Number, required: true, min: 0, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default mongoose.model("InventoryItem", inventoryItemSchema);
```

- [ ] **Step 2: Add controller helpers and list/create handlers**

```js
const getInventoryStatus = ({ quantity, lowStockThreshold }) => {
  if (quantity === 0) return "out";
  if (quantity <= lowStockThreshold) return "low";
  return "healthy";
};

const serializeInventoryItem = (item) => ({
  ...item.toObject(),
  status: getInventoryStatus(item),
});
```

- [ ] **Step 3: Implement `GET /api/inventory` with house scoping**

```js
export const getInventoryItems = async (req, res) => {
  if (!req.user.house) return res.status(400).json({ message: "User not in a house" });

  const { search = "", category, status } = req.query;
  const query = { house: req.user.house };
  if (category) query.category = category;
  if (search) query.name = { $regex: search, $options: "i" };

  const items = await InventoryItem.find(query);
  const filtered = status ? items.filter((item) => getInventoryStatus(item) === status) : items;
  const order = { out: 0, low: 1, healthy: 2 };
  filtered.sort((a, b) => {
    const statusDiff = order[getInventoryStatus(a)] - order[getInventoryStatus(b)];
    if (statusDiff !== 0) return statusDiff;
    const updatedDiff = new Date(b.updatedAt) - new Date(a.updatedAt);
    if (updatedDiff !== 0) return updatedDiff;
    return a.name.localeCompare(b.name);
  });
  res.json(filtered.map(serializeInventoryItem));
};
```

- [ ] **Step 4: Implement create and metadata-update handlers with strict field rules**

```js
export const createInventoryItem = async (req, res) => {
  if (!req.user.house) return res.status(400).json({ message: "User not in a house" });

  const item = await InventoryItem.create({
    ...req.body,
    house: req.user.house,
    createdBy: req.user.id,
    updatedBy: req.user.id,
  });

  res.status(201).json(serializeInventoryItem(item));
};

export const updateInventoryItem = async (req, res) => {
  if (!req.user.house) return res.status(400).json({ message: "User not in a house" });

  const allowedFields = ["name", "category", "unit", "lowStockThreshold"];
  const payload = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
  );

  if ("quantity" in req.body) {
    return res.status(400).json({ message: "Quantity must be changed through adjust actions" });
  }

  const item = await InventoryItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (item.house.toString() !== req.user.house.toString()) {
    return res.status(403).json({ message: "Not authorized to update this item" });
  }

  Object.assign(item, payload, { updatedBy: req.user.id });
  await item.save();

  res.json(serializeInventoryItem(item));
};
```

- [ ] **Step 5: Implement `PATCH /api/inventory/:id/adjust` with explicit validation**

```js
export const adjustInventoryItem = async (req, res) => {
  const { action, amount } = req.body;
  if (!req.user.house) return res.status(400).json({ message: "User not in a house" });
  const item = await InventoryItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (item.house.toString() !== req.user.house.toString()) {
    return res.status(403).json({ message: "Not authorized to update this item" });
  }

  if (!["increment", "decrement", "set"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }
  if ((action === "increment" || action === "decrement") && !(amount > 0)) {
    return res.status(400).json({ message: "Amount must be greater than zero" });
  }
  if (action === "set" && amount < 0) {
    return res.status(400).json({ message: "Amount must be zero or greater" });
  }

  if (action === "increment") item.quantity += amount;
  if (action === "decrement") {
    if (item.quantity - amount < 0) {
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }
    item.quantity -= amount;
  }
  if (action === "set") item.quantity = amount;
  item.updatedBy = req.user.id;
  await item.save();

  res.json(serializeInventoryItem(item));
};
```

- [ ] **Step 6: Implement delete and summary handlers with the exact response shape**

```js
export const deleteInventoryItem = async (req, res) => {
  if (!req.user.house) return res.status(400).json({ message: "User not in a house" });
  const item = await InventoryItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (item.house.toString() !== req.user.house.toString()) {
    return res.status(403).json({ message: "Not authorized to delete this item" });
  }

  await item.deleteOne();
  res.json({ message: "Inventory item deleted successfully" });
};

export const getInventorySummary = async (req, res) => {
  if (!req.user.house) return res.status(400).json({ message: "User not in a house" });

  const order = { out: 0, low: 1, healthy: 2 };
  const items = await InventoryItem.find({ house: req.user.house });
  const serialized = items.map(serializeInventoryItem);
  const urgentItems = serialized
    .filter((item) => item.status !== "healthy")
    .sort((a, b) => {
      const statusDiff = order[a.status] - order[b.status];
      if (statusDiff !== 0) return statusDiff;
      const updatedDiff = new Date(b.updatedAt) - new Date(a.updatedAt);
      if (updatedDiff !== 0) return updatedDiff;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 4);

  res.json({
    totalItems: serialized.length,
    lowStockCount: serialized.filter((item) => item.status === "low").length,
    outOfStockCount: serialized.filter((item) => item.status === "out").length,
    categoryCount: new Set(serialized.map((item) => item.category)).size,
    urgentItems,
  });
};
```

- [ ] **Step 7: Mount the new router in `server/server.js`**

```js
import inventoryRoutes from "./routes/inventory.js";

app.use("/api/inventory", inventoryRoutes);
```

- [ ] **Step 8: Define the authenticated route table in `server/routes/inventory.js`**

```js
import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getInventoryItems,
  getInventorySummary,
  createInventoryItem,
  updateInventoryItem,
  adjustInventoryItem,
  deleteInventoryItem,
} from "../controllers/inventoryController.js";

const router = express.Router();

router.use(authenticate);
router.get("/", getInventoryItems);
router.get("/summary", getInventorySummary);
router.post("/", createInventoryItem);
router.patch("/:id", updateInventoryItem);
router.patch("/:id/adjust", adjustInventoryItem);
router.delete("/:id", deleteInventoryItem);

export default router;
```

- [ ] **Step 9: Run syntax verification for new server files**

Run:
```bash
node --check "server/models/InventoryItem.js" && node --check "server/controllers/inventoryController.js" && node --check "server/routes/inventory.js" && node --check "server/server.js"
```

Expected: command exits successfully with no syntax errors

- [ ] **Step 10: Manually verify the API in dev**

Run:
```bash
npm run dev
```

Manual checks:
- create an inventory item while authenticated
- list items for the active house
- adjust quantity with `increment` and `decrement`
- direct `PATCH /api/inventory/:id` with `quantity` returns `400`
- invalid `action` or invalid `amount` returns `400`
- confirm another house cannot access the item
- confirm summary returns counts and top 4 urgent items

### Task 2: Add Shared Client Query Keys And API Layer

**Files:**
- Modify: `client/src/shared/api/queryKeys.js`
- Create: `client/src/modules/inventory/api/inventoryApi.js`
- Create: `client/src/modules/inventory/api/index.js`
- Create: `client/src/modules/inventory/hooks/useInventory.js`
- Create: `client/src/modules/inventory/hooks/index.js`

- [ ] **Step 1: Add house-scoped query keys**

```js
inventory: {
  list: (houseId, filters) => ["inventory", houseId, filters],
  summary: (houseId) => ["inventory", houseId, "summary"],
}
```

- [ ] **Step 2: Create the inventory API wrapper using the shared Axios client**

```js
import api from "../../../utils/api";

export const inventoryApi = {
  getItems: async ({ houseId, search, category, status }) => {
    const { data } = await api.get("/inventory", { params: { search, category, status } });
    return data;
  },
  getSummary: async () => (await api.get("/inventory/summary")).data,
  createItem: async (payload) => (await api.post("/inventory", payload)).data,
  updateItem: async ({ id, payload }) => (await api.patch(`/inventory/${id}`, payload)).data,
  adjustItem: async ({ id, payload }) => (await api.patch(`/inventory/${id}/adjust`, payload)).data,
  deleteItem: async (id) => (await api.delete(`/inventory/${id}`)).data,
};
```

- [ ] **Step 3: Build the feature hook with React Query**

```js
const listQuery = useQuery({
  queryKey: queryKeys.inventory.list(houseId, filters),
  queryFn: () => inventoryApi.getItems({
    houseId,
    search: filters.search,
    category: filters.category === "all" ? undefined : filters.category,
    status: statusMap[filters.statusLabel],
  }),
  enabled: Boolean(houseId),
});

const summaryQuery = useQuery({
  queryKey: queryKeys.inventory.summary(houseId),
  queryFn: () => inventoryApi.getSummary(),
  enabled: Boolean(houseId),
});

const [filters, setFilters] = useState({
  search: "",
  category: "all",
  statusLabel: "الكل",
});

const createItem = useMutation({ mutationFn: inventoryApi.createItem, onSuccess: invalidateInventory });
const updateItem = useMutation({ mutationFn: inventoryApi.updateItem, onSuccess: invalidateInventory });
const adjustItem = useMutation({ mutationFn: inventoryApi.adjustItem, onSuccess: invalidateInventory });
const deleteItem = useMutation({ mutationFn: inventoryApi.deleteItem, onSuccess: invalidateInventory });
```

- [ ] **Step 4: Add the exact Arabic-to-backend status mapping**

```js
const statusMap = {
  "الكل": undefined,
  "متوفر": "healthy",
  "كمية قليلة": "low",
  "غير متوفر": "out",
};

// expose from the hook
return {
  items: listQuery.data ?? [],
  summary: summaryQuery.data,
  filters,
  setFilters,
  createItem,
  updateItem,
  adjustItem,
  deleteItem,
};
```

- [ ] **Step 5: Add standard invalidation after mutations**

```js
queryClient.invalidateQueries({ queryKey: ["inventory", houseId] });
```

- [ ] **Step 6: Run client lint after the new data layer lands**

Run:
```bash
npm run lint
```

Workdir: `client`

Expected: no new lint errors from inventory API/hook files

### Task 3: Build The Inventory UI Module

**Files:**
- Create: `client/src/modules/inventory/index.js`
- Create: `client/src/modules/inventory/pages/InventoryPage.jsx`
- Create: `client/src/modules/inventory/pages/index.js`
- Create: `client/src/modules/inventory/components/InventoryHeader.jsx`
- Create: `client/src/modules/inventory/components/InventorySummary.jsx`
- Create: `client/src/modules/inventory/components/InventoryFilters.jsx`
- Create: `client/src/modules/inventory/components/InventoryItemCard.jsx`
- Create: `client/src/modules/inventory/components/InventoryList.jsx`
- Create: `client/src/modules/inventory/components/InventoryEmptyState.jsx`
- Create: `client/src/modules/inventory/components/AddInventoryItemModal.jsx`
- Create: `client/src/modules/inventory/components/EditInventoryItemModal.jsx`
- Create: `client/src/modules/inventory/components/RestockInventoryModal.jsx`
- Create: `client/src/modules/inventory/components/LowStockWidget.jsx`
- Create: `client/src/modules/inventory/components/index.js`

- [ ] **Step 1: Add the barrel exports**

```js
export { InventoryPage } from "./pages";
export * from "./components";
export * from "./hooks";
export * from "./api";
```

- [ ] **Step 2: Build the page shell and filters**

```jsx
export default function InventoryPage() {
  const { items, summary, filters, setFilters } = useInventory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [restockingItem, setRestockingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  return (
    <div className="pb-20 space-y-6">
      <InventoryHeader onAdd={() => setShowAddModal(true)} />
      <InventorySummary summary={summary} />
      <InventoryFilters filters={filters} onChange={setFilters} />
      <InventoryList
        items={items}
        onEdit={setEditingItem}
        onRestock={setRestockingItem}
        onDelete={setDeletingItem}
      />
    </div>
  );
}
```

- [ ] **Step 3: Build Arabic-first item cards with status badges and actions**

```jsx
const statusMap = {
  healthy: { label: "متوفر", tone: "success" },
  low: { label: "كمية قليلة", tone: "warning" },
  out: { label: "غير متوفر", tone: "error" },
};

const categoryMap = {
  cleaning: "تنظيف",
  kitchen: "المطبخ",
  bathroom: "الحمام",
  laundry: "الغسيل",
  other: "أخرى",
};
```

- [ ] **Step 4: Add modal forms for create, edit, and restock**

```jsx
<ConfirmModal
  isOpen={showDeleteModal}
  title="حذف الصنف"
  message={`هل أنت متأكد أنك تريد حذف ${item.name}؟`}
  onConfirm={() => onDelete(item._id)}
/>
```

- [ ] **Step 5: Keep edit and restock responsibilities separate**

```jsx
// Edit modal fields
name, category, unit, lowStockThreshold

// Restock submit behavior
adjustItem({ id: item._id, payload: { action: "increment", amount } })
```

- [ ] **Step 6: Make the required status filter explicit in `InventoryFilters`**

```jsx
const statusOptions = ["الكل", "متوفر", "كمية قليلة", "غير متوفر"];
```

- [ ] **Step 7: Add loading, empty, and filtered-empty states without introducing an undefined shared component**

```jsx
if (loading) return <Loader text="بنحمّل المخزون..." />;
if (!summary?.totalItems) return <InventoryEmptyState title="مفيش أصناف لسه" />;
if (!items.length) return <InventoryEmptyState title="مفيش نتائج للفلترة الحالية" actionLabel="مسح الفلاتر" />;
```

- [ ] **Step 8: Build the low-stock widget as a self-fetching shared widget**

```jsx
<LowStockWidget
  houseId={houseId}
/>
```

Widget requirements:
- fetch inventory summary internally with `queryKeys.inventory.summary(houseId)`
- render top 4 urgent items
- show current quantity and status color
- include `عرض المخزون` CTA linking to `/inventory`

- [ ] **Step 9: Run lint after the UI module is in place**

Run:
```bash
npm run lint
```

Workdir: `client`

Expected: inventory page/components pass lint

### Task 4: Integrate Inventory Into Routing, Navigation, And Dashboard

**Files:**
- Modify: `client/src/app/router/routes.jsx`
- Modify: `client/src/shared/components/Sidebar.jsx`
- Modify: `client/src/shared/components/Navbar.jsx`
- Modify: `client/src/modules/dashboard/pages/DashboardPage.jsx`

- [ ] **Step 1: Add the protected route**

```jsx
<Route
  path="/inventory"
  element={
    <ProtectedRoute>
      <InventoryPage />
    </ProtectedRoute>
  }
/>
```

- [ ] **Step 2: Add desktop sidebar entry under house tools**

```jsx
{
  path: "/inventory",
  label: "المخزون",
  icon: Package,
  roles: ["admin", "user"],
}
```

- [ ] **Step 3: Add mobile-only shortcut access in `Navbar.jsx` without changing the 5-slot bottom nav**

```jsx
<Link to="/inventory" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl">
  <Package size={18} />
  <span>المخزون</span>
</Link>
```

- [ ] **Step 4: Render the shared low-stock widget from `DashboardPage.jsx`**

```jsx
{houseId && (
  <div className="mb-6">
    <LowStockWidget houseId={houseId} />
  </div>
)}
```

- [ ] **Step 5: Verify routing and navigation manually**

Manual checks:
- `/inventory` appears in desktop nav
- mobile shortcut reaches inventory page
- dashboard shows low-stock widget for users with a house
- users without a house still redirect to `/house-selection`

### Task 5: Final Verification And Polish

**Files:**
- Verify only; no required new files

- [ ] **Step 1: Run full client lint**

Run:
```bash
npm run lint
```

Workdir: `client`

Expected: pass

- [ ] **Step 2: Run production build**

Run:
```bash
npm run build
```

Workdir: `client`

Expected: Vite build succeeds

- [ ] **Step 3: Re-run server syntax checks**

Run:
```bash
node --check "server/models/InventoryItem.js" && node --check "server/controllers/inventoryController.js" && node --check "server/routes/inventory.js" && node --check "server/server.js"
```

Expected: pass

- [ ] **Step 4: Manual end-to-end verification**

Run local app and confirm:
- create items in multiple categories
- search by name
- filter by category and status
- quick adjust with `+1` and `-1`
- restock flow uses increment behavior
- delete requires confirmation
- low-stock widget updates after mutations
- Arabic labels appear correctly across page, nav, and widget

- [ ] **Step 5: Record the testing limitation explicitly**

Document in final delivery notes:
- this repo currently lacks an automated test harness for feature-level backend/frontend tests
- verification for this feature relies on lint, build, syntax checks, and manual API/UI validation
- automated test setup is intentionally deferred and should be a follow-up if the user wants formal test coverage

- [ ] **Step 6: Prepare concise delivery notes**

Document:
- files added/modified
- verification commands run
- any follow-up limitations, especially absence of automated tests in the current repo
