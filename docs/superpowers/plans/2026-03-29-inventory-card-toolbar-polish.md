# Inventory Card Toolbar Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the inventory card action area into a cleaner toolbar with stronger visual hierarchy and better spacing.

**Architecture:** Keep the existing inventory card data and actions intact, but reorganize the bottom row into a clearer primary-controls cluster and secondary utility-controls cluster. This is a presentation-only change in the card component.

**Tech Stack:** React 19, Vite, Tailwind CSS 4, Lucide React

---

### Task 1: Redesign Inventory Card Actions

**Files:**
- Modify: `client/src/modules/inventory/components/InventoryItemCard.jsx`

- [ ] **Step 1: Keep the same actions, but restructure the bottom row into a balanced toolbar**
- [ ] **Step 2: Group `خصم 1` and `إعادة تعبئة` as primary stock controls with matched sizing**
- [ ] **Step 3: Make `تعديل` and `حذف` a softer secondary utility cluster**
- [ ] **Step 4: Preserve RTL alignment, accessibility labels, and disabled behavior**
- [ ] **Step 5: Run lint**

Run:
```bash
npm run lint
```

Workdir: `client`

Expected: pass

- [ ] **Step 6: Run build**

Run:
```bash
npm run build
```

Workdir: `client`

Expected: pass
