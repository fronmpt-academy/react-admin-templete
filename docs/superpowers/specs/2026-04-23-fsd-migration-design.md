# FSD Migration Design

**Date:** 2026-04-23  
**Project:** material-kit-react  
**Goal:** Team standardization via strict Feature-Sliced Design restructuring

---

## Context

Current project is a Material Kit React admin dashboard (React 19, MUI v7, Vite, TypeScript). The team wants a clear architectural standard so all contributors follow the same conventions. The full codebase will be restructured to FSD in one pass.

---

## Architecture: Layer Mapping

### Import Direction (strictly enforced)
```
app → pages → widgets → features → entities → shared
```

Cross-layer imports in the wrong direction are ESLint errors. Cross-slice imports within the same layer (e.g., one feature importing another feature) are also forbidden — slices communicate only through their public `index.ts`.

### Layer Responsibilities

| Layer | What goes here |
|-------|----------------|
| `app` | App initialization: providers, router, global styles |
| `pages` | Thin page compositions — no logic, just assembles widgets/features |
| `widgets` | Complex independent UI blocks: layouts, analytics charts |
| `features` | User interactions and business logic slices |
| `entities` | Business entity models and their unit-level UI |
| `shared` | Reusable infrastructure: ui, lib, config, theme, api, router |

### Current → FSD Mapping

```
src/main.tsx, src/app.tsx, src/global.css
  → app/

src/pages/*
  → pages/dashboard/
  → pages/user/
  → pages/products/
  → pages/blog/
  → pages/sign-in/
  → pages/not-found/

src/layouts/dashboard/
  → widgets/dashboard-layout/

src/layouts/auth/
  → widgets/auth-layout/

src/layouts/components/  (nav header components)
  → widgets/dashboard-layout/ui/

src/layouts/nav-config-*.tsx
  → widgets/dashboard-layout/model/

src/sections/overview/*
  → widgets/analytics/ui/

src/sections/auth/sign-in-view.tsx
  → features/auth/ui/

src/sections/user/user-table-toolbar.tsx
src/sections/user/user-table-head.tsx
src/sections/user/table-empty-rows.tsx
src/sections/user/table-no-data.tsx
  → features/user-management/ui/

src/sections/user/utils.ts
  → features/user-management/lib/

src/sections/user/user-table-row.tsx
  → entities/user/ui/

src/sections/product/product-filters.tsx
src/sections/product/product-sort.tsx
src/sections/product/product-cart-widget.tsx
  → features/product-catalog/ui/

src/sections/product/product-item.tsx
  → entities/product/ui/

src/sections/blog/post-search.tsx
src/sections/blog/post-sort.tsx
  → features/blog/ui/

src/sections/blog/post-item.tsx
  → entities/post/ui/

src/sections/error/not-found-view.tsx
  → features/error/ui/

src/routes/sections.tsx
  → app/router/

src/routes/hooks/*
  → shared/router/hooks/

src/routes/components/*
  → shared/router/components/

src/theme/*
  → shared/theme/

src/_mock/*
  → shared/api/mock/

src/utils/*
  → shared/lib/

src/config-global.ts
  → shared/config/
```

---

## Segment Structure Within Slices

Each slice uses only the segments it needs:

| Segment | Contents |
|---------|----------|
| `ui/` | React components |
| `model/` | TypeScript types, interfaces |
| `api/` | API calls, slice-specific data fetching |
| `lib/` | Slice-specific helper functions |
| `index.ts` | Public API — only this file is imported from outside |

**Example:**
```
entities/user/
├── ui/
│   └── user-table-row.tsx
├── model/
│   └── types.ts
└── index.ts          ← export { UserTableRow } from './ui/user-table-row'

features/user-management/
├── ui/
│   ├── user-table-toolbar.tsx
│   ├── user-table-head.tsx
│   ├── table-empty-rows.tsx
│   └── table-no-data.tsx
├── lib/
│   └── utils.ts
└── index.ts
```

**Import rule:**
```typescript
// ✅ Correct — always import from the slice public API
import { UserTableRow } from '@entities/user';

// ❌ Forbidden — never import internal files directly
import { UserTableRow } from '@entities/user/ui/user-table-row';
```

---

## `shared/ui` — MUI Re-export Strategy

All MUI components are re-exported from `shared/ui/index.ts`. The codebase never imports directly from `@mui/material`.

```typescript
// shared/ui/index.ts
export { Box, Stack, Grid, Container } from '@mui/material';
export { Button, IconButton } from '@mui/material';
export { LoadingButton } from '@mui/lab';
export { Card, CardContent, CardHeader } from '@mui/material';
export { Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from '@mui/material';
export { Typography } from '@mui/material';
export { TextField, InputAdornment, OutlinedInput } from '@mui/material';
export { Avatar, Chip, Tooltip, Popover } from '@mui/material';
export { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
export { Checkbox } from '@mui/material';
// ... all components actually used in the project
```

**Usage everywhere in the codebase:**
```typescript
import { Button, Card, Typography } from '@shared/ui';
```

Custom components are also placed in `shared/ui/` when they are reusable across multiple slices.

---

## Path Aliases

### `vite.config.ts`
```typescript
resolve: {
  alias: {
    '@app':      path.resolve(__dirname, 'src/app'),
    '@pages':    path.resolve(__dirname, 'src/pages'),
    '@widgets':  path.resolve(__dirname, 'src/widgets'),
    '@features': path.resolve(__dirname, 'src/features'),
    '@entities': path.resolve(__dirname, 'src/entities'),
    '@shared':   path.resolve(__dirname, 'src/shared'),
  }
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "paths": {
      "@app/*":      ["src/app/*"],
      "@pages/*":    ["src/pages/*"],
      "@widgets/*":  ["src/widgets/*"],
      "@features/*": ["src/features/*"],
      "@entities/*": ["src/entities/*"],
      "@shared/*":   ["src/shared/*"]
    }
  }
}
```

---

## ESLint Layer Enforcement

Install `eslint-plugin-boundaries` and configure layer rules.

```
pnpm add -D eslint-plugin-boundaries
```

**Rules enforced:**

| Rule | Description |
|------|-------------|
| Layer direction | Lower layers cannot import from higher layers |
| Cross-slice isolation | Slices within the same layer cannot import each other |
| Public API | External code imports only from `index.ts`, not internal paths |
| `shared` purity | `shared` imports nothing from `app/pages/widgets/features/entities` |

**Allowed import directions:**
- `app` → `pages`, `widgets`, `features`, `entities`, `shared`
- `pages` → `widgets`, `features`, `entities`, `shared`
- `widgets` → `features`, `entities`, `shared`
- `features` → `entities`, `shared`
- `entities` → `shared`
- `shared` → (nothing in this project)

**Violation examples that will be ESLint errors:**
```
❌ features/auth imports from widgets/dashboard-layout
❌ features/auth imports from features/user-management
❌ entities/user imports from features/user-management
❌ shared/lib imports from entities/user
❌ import from '@entities/user/ui/user-table-row' (bypasses index.ts)
```

---

## Final Directory Structure

```
src/
├── app/
│   ├── router/
│   │   └── sections.tsx
│   ├── providers.tsx
│   ├── index.tsx
│   └── styles/
│       └── global.css
├── pages/
│   ├── dashboard/
│   │   └── index.tsx
│   ├── user/
│   │   └── index.tsx
│   ├── products/
│   │   └── index.tsx
│   ├── blog/
│   │   └── index.tsx
│   ├── sign-in/
│   │   └── index.tsx
│   └── not-found/
│       └── index.tsx
├── widgets/
│   ├── dashboard-layout/
│   │   ├── ui/
│   │   │   ├── layout.tsx
│   │   │   ├── nav.tsx
│   │   │   ├── content.tsx
│   │   │   ├── account-popover.tsx
│   │   │   ├── notifications-popover.tsx
│   │   │   ├── searchbar.tsx
│   │   │   ├── language-popover.tsx
│   │   │   ├── workspaces-popover.tsx
│   │   │   ├── menu-button.tsx
│   │   │   └── nav-upgrade.tsx
│   │   ├── model/
│   │   │   ├── nav-config-dashboard.tsx
│   │   │   ├── nav-config-account.tsx
│   │   │   └── nav-config-workspace.tsx
│   │   └── index.ts
│   ├── auth-layout/
│   │   ├── ui/
│   │   │   ├── layout.tsx
│   │   │   └── content.tsx
│   │   └── index.ts
│   └── analytics/
│       ├── ui/
│       │   ├── analytics-news.tsx
│       │   ├── analytics-conversion-rates.tsx
│       │   ├── analytics-tasks.tsx
│       │   ├── analytics-traffic-by-site.tsx
│       │   ├── analytics-website-visits.tsx
│       │   ├── analytics-order-timeline.tsx
│       │   ├── analytics-current-subject.tsx
│       │   ├── analytics-widget-summary.tsx
│       │   └── analytics-current-visits.tsx
│       └── index.ts
├── features/
│   ├── auth/
│   │   ├── ui/
│   │   │   └── sign-in-view.tsx
│   │   └── index.ts
│   ├── user-management/
│   │   ├── ui/
│   │   │   ├── user-table-toolbar.tsx
│   │   │   ├── user-table-head.tsx
│   │   │   ├── table-empty-rows.tsx
│   │   │   └── table-no-data.tsx
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   └── index.ts
│   ├── product-catalog/
│   │   ├── ui/
│   │   │   ├── product-filters.tsx
│   │   │   ├── product-sort.tsx
│   │   │   └── product-cart-widget.tsx
│   │   └── index.ts
│   ├── blog/
│   │   ├── ui/
│   │   │   ├── post-search.tsx
│   │   │   └── post-sort.tsx
│   │   └── index.ts
│   └── error/
│       ├── ui/
│       │   └── not-found-view.tsx
│       └── index.ts
├── entities/
│   ├── user/
│   │   ├── ui/
│   │   │   └── user-table-row.tsx
│   │   ├── model/
│   │   │   └── types.ts
│   │   └── index.ts
│   ├── product/
│   │   ├── ui/
│   │   │   └── product-item.tsx
│   │   ├── model/
│   │   │   └── types.ts
│   │   └── index.ts
│   └── post/
│       ├── ui/
│       │   └── post-item.tsx
│       ├── model/
│       │   └── types.ts
│       └── index.ts
└── shared/
    ├── ui/
    │   └── index.ts
    ├── lib/
    │   ├── format-number.ts
    │   └── format-time.ts
    ├── config/
    │   └── config-global.ts
    ├── theme/
    │   └── (현재 theme/* 전체)
    ├── api/
    │   └── mock/
    │       ├── index.ts
    │       ├── _mock.ts
    │       └── _data.ts
    └── router/
        ├── hooks/
        │   ├── use-pathname.ts
        │   ├── use-router.ts
        │   └── index.ts
        └── components/
            ├── router-link.tsx
            ├── error-boundary.tsx
            └── index.ts
```

---

## Success Criteria

- All files live under the correct FSD layer
- Every slice has an `index.ts` public API
- No MUI imports outside of `shared/ui/index.ts`
- Path aliases (`@app`, `@shared`, etc.) work in both Vite and TypeScript
- `eslint-plugin-boundaries` reports zero violations on `pnpm lint`
- `pnpm build` and `pnpm dev` succeed after migration