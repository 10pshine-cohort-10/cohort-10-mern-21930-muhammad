# Product Context

## Platform
web

## Positioning
A fast, tactile MERN + TypeScript notes workspace built around a physical desk-pinboard mental model: ephemeral local staging in the **Scratchpad / Draft Blotter** (`/scratchpad`) and organized, real-time synced storage on the **Cloud Desk** (`/dashboard`).

## Users & Jobs
- **Unauthenticated Visitors (Guest Scratchpad):** Capture ideas immediately in `localStorage` (`notes_guest_drafts`) with zero signup friction, then sync seamlessly on account creation or login.
- **Authenticated Workspace Users (Desk + Draft Blotter):**
  - Capture rough, unfiled thoughts in **Draft Blotter** (`/scratchpad`) without cluttering the synced board, then promote them via **Tack to Desk** (individually or in bulk).
  - Organize, pin, folder-tag (`#folder`), search, archive (`/archive`), and export/import (JSON & Markdown) notes on `/dashboard` with real-time Socket.IO sync.

## Core Workflows
1. **Guest Capture -> Cloud Sync:** `/scratchpad` (Quick-Jot / `NoteEditor` -> `localStorage`) -> `/register` or `/login` (`syncGuestNotesIfAny`) -> `/dashboard`.
2. **Draft Blotter -> Desk Promotion:** Logged-in `/scratchpad` -> **Tack to Desk** / **Tack All to Desk** -> `POST /api/notes` -> removed from local blotter.
3. **Desk Organization & Keyboard Flow:** `QuickTackBar` floating capture dock, `CommandPalette` (`Ctrl+K`), `useDeskKeyboardNav`, collapsible sidebar `#folder` tree with `AddFolderModal`, and `UndoToast` soft delete.

## Operating Context
React 19 + Vite SPA (`frontend/`) backed by Express 5 + MongoDB/Mongoose + Socket.IO (`backend/`), responsive across desktop (collapsible `260px`/`68px` sidebar) and mobile (`MobileNavDock` <= `768px`).

## Product Principles
- **Zero-friction capture first:** Both `/scratchpad` (Quick-Jot) and `/dashboard` (`QuickTackBar`) support single-Enter note creation.
- **Intentional promotion:** Local drafts stay out of the synced cloud board until the user explicitly clicks **Tack to Desk** or **Tack All to Desk**.
- **Consistent monochrome chrome:** Ink-black (`#18181b`) and neutral zinc (`#fafafa`, `#ffffff`, `#f4f4f5`, `#e4e4e7`) across all modals, auth pages, sidebar, and controls; pastel card surfaces reserved for note cards.

## Evidence on Hand
- Dual-agent Impeccable critiques completed for layout layers, color consistency, and Scratchpad UX.
- `impeccable detect --json frontend/src`: 0 findings; 18/18 frontend Jest suites (57 tests) and production build passing.
