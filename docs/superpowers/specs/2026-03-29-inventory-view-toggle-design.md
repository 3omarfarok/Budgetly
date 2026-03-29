# Inventory View Toggle Design

## Goal

Extend the inventory feature with a second results presentation mode so users can switch between the current card layout and a denser table layout, while removing the healthy-state helper sentence from inventory cards.

## Product Direction

- Keep the current card view as the default experience.
- Add a user-controlled toggle between `بطاقات` and `جدول`.
- Preserve the same inventory capabilities in both views.
- Keep the inventory feature Arabic-first and mobile-friendly.
- Remove the healthy helper sentence from cards entirely.

## Scope

### In Scope

- View toggle for inventory results
- New table-based inventory results view
- Local persistence of the selected view mode
- Shared actions in both views:
  - `خصم 1`
  - `إعادة تعبئة`
  - `تعديل`
  - `حذف`
- Removal of the healthy helper copy from card view

### Out of Scope

- New backend endpoints
- New inventory fields
- Bulk actions
- Sorting controls beyond current server ordering
- Pagination redesign
- Changes to dashboard widget behavior

## User Experience

### View Toggle

- Add a compact segmented control with two options:
  - `بطاقات`
  - `جدول`
- Place it near the inventory filters/results controls so the toggle feels part of the list tooling.
- Default to `بطاقات` for first-time users.
- Persist the last selected mode in browser storage so the preferred view returns after refresh.

### Card View

- Keep the current visual card layout.
- Remove the healthy-state helper sentence:
  - `الوضع مطمئن حاليًا، لكن تابع الكمية بانتظام.`
- Keep low and out-of-stock helper text.
- Preserve existing card actions and status emphasis.

### Table View

- Add a dedicated inventory table component.
- Each row should include:
  - `الصنف`
  - `التصنيف`
  - `الحالة`
  - `الكمية الحالية`
  - `حد التنبيه`
  - `آخر تحديث`
  - `الإجراءات`
- The table should visually distinguish low/out-of-stock rows primarily through status styling and subtle row emphasis.
- The table should support all current actions without losing functionality.

### Mobile Behavior

- Keep cards fully available on mobile.
- In table mode, wrap the table in a horizontally scrollable container rather than compressing columns too aggressively.
- Maintain readable tap targets for row actions.

## Functional Requirements

### Shared Results Behavior

- Loading state remains shared between both views.
- Empty state remains shared between both views.
- Error state remains shared between both views.
- Filters affect both views equally.
- Search, category, and status filtering remain unchanged.

### Shared Actions

Both views must support the same action handlers and modal flows:

- `خصم 1`
- `إعادة تعبئة`
- `تعديل`
- `حذف`

No view-specific business logic should be introduced for these actions.

### Persistence

- Store the selected view mode in local storage.
- Restore it on page load.
- Accept only valid values: `cards` or `table`.
- Fall back to `cards` for missing or invalid stored values.

## Architecture

### Existing Components To Extend

- `client/src/modules/inventory/pages/InventoryPage.jsx`
- `client/src/modules/inventory/hooks/useInventoryPageController.js`
- `client/src/modules/inventory/components/InventoryList.jsx`
- `client/src/modules/inventory/components/InventoryItemCard.jsx`

### New Components To Add

- `client/src/modules/inventory/components/InventoryTable.jsx`
- optional small shared view-toggle component if implementation stays cleaner that way

### Implementation Shape

- Keep `InventoryList` as the main results entry point.
- `InventoryList` decides whether to render:
  - the existing card grid
  - or the new table component
- Add a view-mode state in the page/controller layer.
- Keep the actions flowing through the same controller methods already used by card mode.

## Data And State

### View State

- Introduce `viewMode` with values:
  - `cards`
  - `table`
- Controller should expose:
  - current mode
  - toggle/update handler
  - any derived labels needed by the UI

### State Boundaries

- View mode is a presentation concern only.
- Do not move filtering or mutation logic into the table component.
- Do not duplicate modal logic for table rows.

## Visual Design

- Keep the inventory module aligned with the current rounded, iOS-inspired Budgetly look.
- Table container should feel like part of the same feature, not a generic admin grid.
- Use existing status badge styling for consistency.
- Preserve Arabic-first spacing and RTL-friendly alignment.
- Keep the table readable in dark mode and light mode.

## Accessibility

- Toggle buttons must expose clear state for the active mode.
- Table headers must be semantic table headers.
- Row actions must keep item-specific accessible names.
- Horizontal scrolling container must not hide critical actions off-screen without obvious affordance.

## Verification

### Functional Checks

- Default inventory view is cards.
- Switching to table mode updates the rendered layout.
- Refreshing the page preserves the selected view.
- Filters work in both views.
- `خصم 1` works in both views.
- `إعادة تعبئة` works in both views.
- `تعديل` works in both views.
- `حذف` works in both views.

### Content Checks

- Healthy card items no longer show the removed helper sentence.
- Low and out-of-stock helper messages remain present in cards.

### Responsive Checks

- Card mode remains intact on mobile.
- Table mode remains usable on mobile through horizontal scrolling.

## Risks And Guardrails

- Avoid duplicating item action logic across card and table views.
- Avoid introducing a table-only behavior mismatch.
- Avoid replacing the existing card experience; this is an additive enhancement.
- Avoid table density that becomes unreadable in Arabic on smaller screens.
