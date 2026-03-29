# Inventory Header Flat Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the decorative gradient/glow treatment from the inventory header and replace it with a clean flat surface.

**Architecture:** Keep the existing header layout, badge, counters, helper text, stat pills, and CTA exactly as they are, but simplify the background treatment at the source in `InventoryHeader.jsx`. This is a presentation-only change with no data-flow or behavior impact.

**Tech Stack:** React 19, Vite, Tailwind CSS 4

---

### Task 1: Flatten Inventory Header Background

**Files:**
- Modify: `client/src/modules/inventory/components/InventoryHeader.jsx`

- [ ] **Step 1: Remove the gradient and decorative overlay layers**

```jsx
<section className="... bg-ios-surface ...">
```

Remove these exact treatments:
- `bg-gradient-to-br`
- the radial/linear overlay layer
- both blurred glow circles

- [ ] **Step 2: Keep contrast strong on dark mode with a flat surface and existing text/button hierarchy**

```jsx
className="... bg-ios-surface dark:bg-[#16161c] ..."
```

- [ ] **Step 3: Run lint**

Run:
```bash
npm run lint
```

Workdir: `client`

Expected: pass

- [ ] **Step 4: Run build**

Run:
```bash
npm run build
```

Workdir: `client`

Expected: pass
