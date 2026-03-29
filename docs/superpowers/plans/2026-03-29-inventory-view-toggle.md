# Inventory View Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent `بطاقات` / `جدول` results toggle to inventory, preserve all existing item actions in both views, and remove the healthy helper sentence from inventory cards.

**Architecture:** Keep `InventoryList` as the single results entry point and make it render either the existing card grid or a new inventory table based on page-level presentation state. Store the selected view mode in local storage, keep all existing filtering and mutation flows shared, and avoid adding any new backend behavior.

**Tech Stack:** React 19, React Query, React Router, Vite, Tailwind CSS 4, Lucide React

---

## File Structure

### Existing Files To Modify

- `client/src/modules/inventory/pages/InventoryPage.jsx` — pass view-mode state and render controls/results with the new toggle
- `client/src/modules/inventory/hooks/useInventoryPageController.js` — own the view-mode state and persistence wiring exposed to the page
- `client/src/modules/inventory/components/InventoryList.jsx` — choose between card grid and table view while keeping shared empty/loading/error behavior
- `client/src/modules/inventory/components/InventoryItemCard.jsx` — remove the healthy helper sentence only
- `client/src/modules/inventory/components/InventoryFilters.jsx` — add the compact view toggle near the result controls without breaking current filters
- `client/src/modules/inventory/components/index.js` — export the new table component if needed

### New Files To Create

- `client/src/modules/inventory/components/InventoryTable.jsx` — render the table-mode inventory rows and shared actions
- `client/src/modules/inventory/hooks/useInventoryViewMode.js` — own local-storage-backed `cards` / `table` persistence and normalization

### No-Change Boundaries

- Do not change backend inventory routes or models
- Do not add new inventory fields
- Do not create table-only mutation logic
- Do not change dashboard widget behavior

## Verification Notes

- This repo does not currently have an automated test harness for the inventory UI
- Verification for this enhancement should rely on:
  - `npm run lint` in `client`
  - `npm run build` in `client`
  - manual UI verification in dev
- Keep the implementation TDD-minded in structure, but use lint/build/manual verification as the practical evidence path in this repo

### Task 1: Add Persistent Inventory View Mode State

**Files:**
- Create: `client/src/modules/inventory/hooks/useInventoryViewMode.js`
- Modify: `client/src/modules/inventory/hooks/useInventoryPageController.js`

- [ ] **Step 1: Create a focused hook for view-mode persistence**

```js
const STORAGE_KEY = "budgetly-inventory-view-mode";
const VALID_VIEW_MODES = new Set(["cards", "table"]);

const normalizeViewMode = (value) => (VALID_VIEW_MODES.has(value) ? value : "cards");
```

- [ ] **Step 2: Restore the stored mode on first render**

```js
const [viewMode, setViewMode] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return normalizeViewMode(saved);
});
```

- [ ] **Step 3: Persist view changes**

```js
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, viewMode);
}, [viewMode]);
```

- [ ] **Step 4: Expose the view state from the page controller**

```js
viewMode,
isTableView: viewMode === "table",
setViewMode,
viewModeOptions: [
  { value: "cards", label: "بطاقات" },
  { value: "table", label: "جدول" },
],
```

- [ ] **Step 5: Run lint to verify the new hook compiles cleanly**

Run:
```bash
npm run lint
```

Workdir: `client`

Expected: pass with no new lint errors

### Task 2: Add The Table Results Component

**Files:**
- Create: `client/src/modules/inventory/components/InventoryTable.jsx`
- Modify: `client/src/modules/inventory/components/index.js`
- Modify: `client/src/modules/inventory/constants.js` (only if a shared formatting helper needs export reuse)

- [ ] **Step 1: Create the table shell with semantic headers**

```jsx
<div className="overflow-x-auto rounded-[28px] border border-ios-border bg-ios-surface shadow-sm">
  <table className="min-w-[920px] w-full border-collapse text-right" dir="rtl">
    <thead>
      <tr>
        <th>الصنف</th>
        <th>التصنيف</th>
        <th>الحالة</th>
        <th>الكمية الحالية</th>
        <th>حد التنبيه</th>
        <th>آخر تحديث</th>
        <th>الإجراءات</th>
      </tr>
    </thead>
  </table>
</div>
```

- [ ] **Step 2: Render item rows using the same status/category metadata as cards**

```jsx
const statusMeta = STATUS_META[item.status] ?? STATUS_META.healthy;
const categoryLabel = CATEGORY_LABELS[item.category] ?? CATEGORY_LABELS.other;
```

- [ ] **Step 3: Add shared row actions with the same behavior as cards**

```jsx
<button
  onClick={() => onDecrease({ id: item._id, action: "decrement", amount: 1 })}
  disabled={isAdjusting || item.quantity <= 0}
  aria-label={`خصم قطعة واحدة من ${item.name}`}
>
  خصم 1
</button>
<button onClick={() => onRestock(item)} aria-label={`إعادة تعبئة ${item.name}`}>إعادة تعبئة</button>
<button onClick={() => onEdit(item)} aria-label={`تعديل ${item.name}`}>تعديل</button>
<button onClick={() => onDelete(item)} aria-label={`حذف ${item.name}`}>حذف</button>
```

- [ ] **Step 4: Add subtle row emphasis for low/out states**

```jsx
const rowClassName = item.status === "out"
  ? "bg-rose-500/6"
  : item.status === "low"
    ? "bg-amber-400/6"
    : "bg-transparent";
```

- [ ] **Step 5: Export the new component from the inventory component barrel**

```js
export { default as InventoryTable } from "./InventoryTable";
```

- [ ] **Step 6: Run lint after the table component lands**

Run:
```bash
npm run lint
```

Workdir: `client`

Expected: pass

### Task 3: Wire The Toggle Into Filters And Results

**Files:**
- Modify: `client/src/modules/inventory/components/InventoryFilters.jsx`
- Modify: `client/src/modules/inventory/components/InventoryList.jsx`
- Modify: `client/src/modules/inventory/pages/InventoryPage.jsx`

- [ ] **Step 1: Add the segmented view toggle UI**

```jsx
<div className="inline-flex rounded-2xl border border-ios-border bg-ios-light/60 p-1" role="group" aria-label="طريقة عرض المخزون">
  {viewModeOptions.map((option) => (
    <button key={option.value} type="button" aria-pressed={viewMode === option.value}>
      {option.label}
    </button>
  ))}
</div>
```

- [ ] **Step 2: Pass `viewMode` and `setViewMode` through the page into filters/results**

```jsx
<InventoryFilters
  ...
  viewMode={view.viewMode}
  viewModeOptions={view.viewModeOptions}
  onViewModeChange={view.setViewMode}
/>

<InventoryList
  ...
  viewMode={view.viewMode}
/>
```

- [ ] **Step 3: Make `InventoryList` render cards or table without changing shared state handling**

```jsx
if (viewMode === "table") {
  return <InventoryTable ... />;
}

return <section className="grid ...">...</section>;
```

- [ ] **Step 4: Add a visible mobile affordance for horizontally scrollable table content**

```jsx
<div className="space-y-3">
  <p className="text-xs font-medium text-ios-secondary md:hidden">اسحب الجدول أفقيًا لعرض كل الأعمدة والإجراءات.</p>
  <div className="overflow-x-auto">...</div>
</div>
```

- [ ] **Step 5: Apply explicit light/dark readability styling to the table container, cells, and row states**

```jsx
<div className="overflow-x-auto rounded-[28px] border border-ios-border bg-ios-surface shadow-sm dark:border-white/8">
  <table className="... text-ios-dark dark:text-white">...</table>
</div>
```

- [ ] **Step 6: Keep empty, loading, and error states shared before the view switch branch**

```jsx
if (isLoading) return <Loader ... />;
if (hasItemsError && !items.length) return <InventoryEmptyState variant="error" ... />;
if (!items.length) return <InventoryEmptyState ... />;
```

- [ ] **Step 7: Run lint after the toggle wiring is complete**

Run:
```bash
npm run lint
```

Workdir: `client`

Expected: pass

### Task 4: Remove Healthy Helper Copy From Cards

**Files:**
- Modify: `client/src/modules/inventory/components/InventoryItemCard.jsx`

- [ ] **Step 1: Remove the healthy helper sentence only**

```jsx
{item.status === "out"
  ? "الصنف خلص تمامًا ويحتاج إعادة تعبئة فورًا."
  : item.status === "low"
    ? "الكمية قربت تخلص، الأفضل تعيد التخزين قريب."
    : null}
```

- [ ] **Step 2: Avoid leaving an empty helper box for healthy items**

```jsx
{statusMessage ? (
  <div className="...">{statusMessage}</div>
) : null}
```

- [ ] **Step 3: Re-run lint to verify the card cleanup**

Run:
```bash
npm run lint
```

Workdir: `client`

Expected: pass

### Task 5: Final Verification

**Files:**
- Verify only

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

- [ ] **Step 3: Manual verification in local dev**

Check:
- page defaults to `بطاقات`
- switching to `جدول` changes the result layout
- refreshing preserves the selected mode
- invalid stored view values fall back to `بطاقات`
- toggle exposes a clear active state for keyboard/screen-reader users
- loading state stays shared and correct in both views
- empty state stays shared and correct in both views
- error state stays shared and correct in both views
- filters behave the same in both `بطاقات` and `جدول` views
- all row actions work in table mode
- `خصم 1` disables in table mode when quantity is `0` or a quantity mutation is pending
- card actions still work in card mode
- healthy cards no longer show the removed sentence
- table remains readable in dark mode and light mode
- low/out helper messages still appear on cards
- card mode remains intact on mobile
- mobile table stays usable with horizontal scrolling and visible scroll affordance text

- [ ] **Step 4: Record delivery notes**

Document:
- files added/modified
- verification commands run
- limitation that this repo still lacks automated UI tests for this flow
