# Inventory Optimistic Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make inventory actions update the UI immediately before the server responds, with rollback to the previous state on failure.

**Architecture:** Implement optimistic cache updates inside `useInventory` so all inventory views share the same immediate behavior. Update both list queries and summary cache entries in `onMutate`, capture snapshots for rollback, and still invalidate/refetch on settle for server truth.

**Tech Stack:** React 19, React Query, Vite

---

### Task 1: Add Optimistic Inventory Cache Updates

**Files:**
- Modify: `client/src/modules/inventory/hooks/useInventory.js`

- [ ] **Step 1: Add shared helpers for inventory status, filtered list matching, and summary recomputation**
- [ ] **Step 2: Snapshot all inventory queries for the active house before each optimistic mutation**
- [ ] **Step 3: Optimistically update list caches and summary for create/update/adjust/delete**
- [ ] **Step 4: Roll back snapshots on mutation failure**
- [ ] **Step 5: Keep a final invalidate/refetch on settle so cache syncs with server truth**
- [ ] **Step 6: Run lint**

Run:
```bash
npm run lint
```

Workdir: `client`

Expected: pass

- [ ] **Step 7: Run build**

Run:
```bash
npm run build
```

Workdir: `client`

Expected: pass
