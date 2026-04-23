# FSD Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure material-kit-react from the current ad-hoc layout to strict Feature-Sliced Design (FSD) with ESLint boundary enforcement.

**Architecture:** Bottom-up build — create `shared` first, then `entities`, `features`, `widgets`, `pages`, `app`. All new files live under `src/{layer}/` with `@layer` path aliases. Old files stay until Task 11 (deletion), so the app keeps building throughout. The `src/` alias remains active until Task 11 removes it.

**Tech Stack:** React 19, TypeScript, MUI v7, Vite, react-router-dom v7, eslint-plugin-boundaries (new)

---

## Import Replacement Reference

All files moved to FSD layers follow these substitution rules:

| Old import | New import |
|------------|------------|
| `from 'src/config-global'` | `from '@shared/config'` |
| `from 'src/_mock'` | `from '@shared/api'` |
| `from 'src/utils/format-number'` | `from '@shared/lib'` |
| `from 'src/utils/format-time'` | `from '@shared/lib'` |
| `from 'src/routes/hooks'` | `from '@shared/router'` |
| `from 'src/routes/components'` | `from '@shared/router'` |
| `from 'src/theme/...'` | `from '@shared/theme'` |
| `from 'src/components/iconify'` | `from '@shared/ui'` |
| `from 'src/components/label'` | `from '@shared/ui'` |
| `from 'src/components/logo'` | `from '@shared/ui'` |
| `from 'src/components/scrollbar'` | `from '@shared/ui'` |
| `from 'src/components/svg-color'` | `from '@shared/ui'` |
| `from 'src/components/color-utils'` | `from '@shared/ui'` |
| `from 'src/components/chart'` | `from '@shared/ui'` |
| `from 'src/layouts/core/...'` | `from '@shared/ui'` |
| `from 'src/layouts/dashboard'` | `from '@widgets/dashboard-layout'` |
| `from 'src/layouts/auth'` | `from '@widgets/auth-layout'` |
| `from '../analytics-*'` (in overview) | `from '@widgets/analytics'` |
| `from '@mui/material/Foo'` | `from '@shared/ui'` |
| `from '@mui/material/styles'` (types only) | keep as-is (type-only imports allowed) |
| `from '@mui/material/styles'` (values) | `from '@shared/ui'` |
| `from '@mui/lab/...'` | `from '@shared/ui'` |

---

## Task 1: Configure Path Aliases

**Files:**
- Modify: `vite.config.ts`
- Modify: `tsconfig.json`

- [ ] **Step 1: Update `vite.config.ts`**

```typescript
import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const PORT = 3039;

export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
      overlay: { position: 'tl', initialIsOpen: false },
    }),
  ],
  resolve: {
    alias: [
      // FSD layer aliases (new)
      { find: '@app',      replacement: path.resolve(process.cwd(), 'src/app') },
      { find: '@pages',    replacement: path.resolve(process.cwd(), 'src/pages') },
      { find: '@widgets',  replacement: path.resolve(process.cwd(), 'src/widgets') },
      { find: '@features', replacement: path.resolve(process.cwd(), 'src/features') },
      { find: '@entities', replacement: path.resolve(process.cwd(), 'src/entities') },
      { find: '@shared',   replacement: path.resolve(process.cwd(), 'src/shared') },
      // Legacy alias — KEEP until Task 11 removes old directories
      { find: /^src(.+)/, replacement: path.resolve(process.cwd(), 'src/$1') },
    ],
  },
  server: { port: PORT, host: true },
  preview: { port: PORT, host: true },
});
```

- [ ] **Step 2: Update `tsconfig.json`**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "module": "ESNext",
    "jsx": "react-jsx",
    "allowJs": true,
    "resolveJsonModule": true,
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "incremental": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "strict": true,
    "noEmit": true,
    "strictNullChecks": true,
    "paths": {
      "@app/*":      ["src/app/*"],
      "@pages/*":    ["src/pages/*"],
      "@widgets/*":  ["src/widgets/*"],
      "@features/*": ["src/features/*"],
      "@entities/*": ["src/entities/*"],
      "@shared/*":   ["src/shared/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Verify TypeScript sees the paths**

```bash
pnpm tsc --noEmit
```

Expected: same errors as before (no new errors from alias changes).

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts tsconfig.json
git commit -m "build: add FSD layer path aliases to vite and tsconfig"
```

---

## Task 2: Build `shared/lib`, `shared/config`, `shared/api`

**Files:**
- Create: `src/shared/lib/format-number.ts`
- Create: `src/shared/lib/format-time.ts`
- Create: `src/shared/lib/index.ts`
- Create: `src/shared/config/config-global.ts`
- Create: `src/shared/config/index.ts`
- Create: `src/shared/api/mock/_mock.ts`
- Create: `src/shared/api/mock/_data.ts`
- Create: `src/shared/api/mock/index.ts`
- Create: `src/shared/api/index.ts`

- [ ] **Step 1: Create lib files**

```bash
mkdir -p src/shared/lib src/shared/config src/shared/api/mock
```

Copy `src/utils/format-number.ts` → `src/shared/lib/format-number.ts` (no import changes needed — file has no internal imports).

Copy `src/utils/format-time.ts` → `src/shared/lib/format-time.ts` (no import changes needed).

Create `src/shared/lib/index.ts`:
```typescript
export * from './format-number';
export * from './format-time';
```

- [ ] **Step 2: Create config**

Copy `src/config-global.ts` → `src/shared/config/config-global.ts` (no import changes — only imports `package.json`).

Create `src/shared/config/index.ts`:
```typescript
export * from './config-global';
```

- [ ] **Step 3: Create api/mock**

Copy `src/_mock/_mock.ts` → `src/shared/api/mock/_mock.ts` (no import changes needed).
Copy `src/_mock/_data.ts` → `src/shared/api/mock/_data.ts` (no import changes needed).

Create `src/shared/api/mock/index.ts`:
```typescript
export * from './_mock';
export * from './_data';
```

Create `src/shared/api/index.ts`:
```typescript
export * from './mock';
```

- [ ] **Step 4: Verify**

```bash
pnpm tsc --noEmit
```

Expected: zero new errors.

- [ ] **Step 5: Commit**

```bash
git add src/shared/
git commit -m "feat(shared): add lib, config, api/mock layers"
```

---

## Task 3: Build `shared/router`

**Files:**
- Create: `src/shared/router/hooks/use-pathname.ts`
- Create: `src/shared/router/hooks/use-router.ts`
- Create: `src/shared/router/hooks/index.ts`
- Create: `src/shared/router/components/router-link.tsx`
- Create: `src/shared/router/components/error-boundary.tsx`
- Create: `src/shared/router/components/index.ts`
- Create: `src/shared/router/index.ts`

- [ ] **Step 1: Create directories**

```bash
mkdir -p src/shared/router/hooks src/shared/router/components
```

- [ ] **Step 2: Copy hooks (no import changes)**

Copy `src/routes/hooks/use-pathname.ts` → `src/shared/router/hooks/use-pathname.ts` (unchanged).
Copy `src/routes/hooks/use-router.ts` → `src/shared/router/hooks/use-router.ts` (unchanged).

Create `src/shared/router/hooks/index.ts`:
```typescript
export { useRouter } from './use-router';
export { usePathname } from './use-pathname';
```

- [ ] **Step 3: Copy router-link (no import changes)**

Copy `src/routes/components/router-link.tsx` → `src/shared/router/components/router-link.tsx` (unchanged — only imports from `react-router`).

- [ ] **Step 4: Create error-boundary with updated MUI import**

Create `src/shared/router/components/error-boundary.tsx`:

```tsx
import type { Theme, CSSObject } from '@mui/material/styles';

import { useRouteError, isRouteErrorResponse } from 'react-router';

import { GlobalStyles } from '@shared/ui';

// ----------------------------------------------------------------------

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <>
      {inputGlobalStyles()}
      <div className={errorBoundaryClasses.root}>
        <div className={errorBoundaryClasses.container}>{renderErrorMessage(error)}</div>
      </div>
    </>
  );
}

// ----------------------------------------------------------------------

function parseStackTrace(stack?: string) {
  if (!stack) return { filePath: null, functionName: null };
  const filePathMatch = stack.match(/\/src\/[^?]+/);
  const functionNameMatch = stack.match(/at (\S+)/);
  return {
    filePath: filePathMatch ? filePathMatch[0] : null,
    functionName: functionNameMatch ? functionNameMatch[1] : null,
  };
}

function renderErrorMessage(error: any) {
  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1 className={errorBoundaryClasses.title}>{error.status}: {error.statusText}</h1>
        <p className={errorBoundaryClasses.message}>{error.data}</p>
      </>
    );
  }
  if (error instanceof Error) {
    const { filePath, functionName } = parseStackTrace(error.stack);
    return (
      <>
        <h1 className={errorBoundaryClasses.title}>Unexpected Application Error!</h1>
        <p className={errorBoundaryClasses.message}>{error.name}: {error.message}</p>
        <pre className={errorBoundaryClasses.details}>{error.stack}</pre>
        {(filePath || functionName) && (
          <p className={errorBoundaryClasses.filePath}>{filePath} ({functionName})</p>
        )}
      </>
    );
  }
  return <h1 className={errorBoundaryClasses.title}>Unknown Error</h1>;
}

// ----------------------------------------------------------------------

const errorBoundaryClasses = {
  root: 'error-boundary-root',
  container: 'error-boundary-container',
  title: 'error-boundary-title',
  details: 'error-boundary-details',
  message: 'error-boundary-message',
  filePath: 'error-boundary-file-path',
};

const cssVars: CSSObject = {
  '--info-color': '#2dd9da',
  '--warning-color': '#e2aa53',
  '--error-color': '#ff5555',
  '--error-background': '#2a1e1e',
  '--details-background': '#111111',
  '--root-background': '#2c2c2e',
  '--container-background': '#1c1c1e',
  '--font-stack-monospace': '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
  '--font-stack-sans': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const rootStyles = (): CSSObject => ({
  display: 'flex', flex: '1 1 auto', alignItems: 'center',
  padding: '10vh 15px 0', flexDirection: 'column',
  fontFamily: 'var(--font-stack-sans)',
});
const contentStyles = (): CSSObject => ({
  gap: 24, padding: 20, width: '100%', maxWidth: 960,
  display: 'flex', borderRadius: 8, flexDirection: 'column',
  backgroundColor: 'var(--container-background)',
});
const titleStyles = (theme: Theme): CSSObject => ({
  margin: 0, lineHeight: 1.2,
  fontSize: theme.typography.pxToRem(20),
  fontWeight: theme.typography.fontWeightBold,
});
const messageStyles = (theme: Theme): CSSObject => ({
  margin: 0, lineHeight: 1.5, padding: '12px 16px', whiteSpace: 'pre-wrap',
  color: 'var(--error-color)', fontSize: theme.typography.pxToRem(14),
  fontFamily: 'var(--font-stack-monospace)', backgroundColor: 'var(--error-background)',
  borderLeft: '2px solid var(--error-color)', fontWeight: theme.typography.fontWeightBold,
});
const detailsStyles = (): CSSObject => ({
  margin: 0, padding: 16, lineHeight: 1.5, overflow: 'auto',
  borderRadius: 'inherit', color: 'var(--warning-color)',
  backgroundColor: 'var(--details-background)',
});
const filePathStyles = (): CSSObject => ({ marginTop: 0, color: 'var(--info-color)' });

const inputGlobalStyles = () => (
  <GlobalStyles
    styles={(theme) => ({
      body: {
        ...cssVars,
        margin: 0,
        color: 'white',
        backgroundColor: 'var(--root-background)',
        [`& .${errorBoundaryClasses.root}`]: rootStyles(),
        [`& .${errorBoundaryClasses.container}`]: contentStyles(),
        [`& .${errorBoundaryClasses.title}`]: titleStyles(theme),
        [`& .${errorBoundaryClasses.message}`]: messageStyles(theme),
        [`& .${errorBoundaryClasses.filePath}`]: filePathStyles(),
        [`& .${errorBoundaryClasses.details}`]: detailsStyles(),
      },
    })}
  />
);
```

- [ ] **Step 5: Create index files**

Create `src/shared/router/components/index.ts`:
```typescript
export * from './router-link';
export * from './error-boundary';
```

Create `src/shared/router/index.ts`:
```typescript
export * from './hooks';
export * from './components';
```

- [ ] **Step 6: Verify**

```bash
pnpm tsc --noEmit
```

Expected: zero new errors.

- [ ] **Step 7: Commit**

```bash
git add src/shared/router/
git commit -m "feat(shared): add router layer (hooks + components)"
```

---

## Task 4: Build `shared/theme`

**Files:**
- Create: `src/shared/theme/` (all files from `src/theme/`)

- [ ] **Step 1: Copy theme directory**

```bash
cp -r src/theme src/shared/theme
```

This copies all files. No internal import changes needed — all imports within `src/theme/` are relative (`'./core'`, `'./types'`, etc.) and remain valid after the copy.

- [ ] **Step 2: Verify the copy has index.ts**

`src/shared/theme/index.ts` should export:
```typescript
export * from './core';
export * from './types';
export * from './theme-config';
export * from './theme-provider';
```

(This is identical to the original `src/theme/index.ts`.)

- [ ] **Step 3: Verify**

```bash
pnpm tsc --noEmit
```

Expected: zero new errors.

- [ ] **Step 4: Commit**

```bash
git add src/shared/theme/
git commit -m "feat(shared): add theme layer"
```

---

## Task 5: Build `shared/ui`

**Files:**
- Create: `src/shared/ui/index.ts`
- Create: `src/shared/ui/layout-core/` (copy from `src/layouts/core/`)
- Create: `src/shared/ui/chart/` (copy from `src/components/chart/`)
- Create: `src/shared/ui/color-utils/` (copy from `src/components/color-utils/`)
- Create: `src/shared/ui/iconify/` (copy from `src/components/iconify/`)
- Create: `src/shared/ui/label/` (copy from `src/components/label/`)
- Create: `src/shared/ui/logo/` (copy from `src/components/logo/`)
- Create: `src/shared/ui/scrollbar/` (copy from `src/components/scrollbar/`)
- Create: `src/shared/ui/svg-color/` (copy from `src/components/svg-color/`)

- [ ] **Step 1: Copy component subdirectories**

```bash
mkdir -p src/shared/ui
cp -r src/components/chart      src/shared/ui/chart
cp -r src/components/color-utils src/shared/ui/color-utils
cp -r src/components/iconify    src/shared/ui/iconify
cp -r src/components/label      src/shared/ui/label
cp -r src/components/logo       src/shared/ui/logo
cp -r src/components/scrollbar  src/shared/ui/scrollbar
cp -r src/components/svg-color  src/shared/ui/svg-color
cp -r src/layouts/core          src/shared/ui/layout-core
```

All files in `src/components/*/` use only relative imports internally — no changes needed.

The `src/layouts/core/` files use only relative imports (`'./classes'`, `'./css-vars'`) and one MUI import. No changes needed since all relative imports stay valid.

- [ ] **Step 2: Create `src/shared/ui/index.ts`**

This is the single point of entry for all UI. Every consumer does `import { Foo } from '@shared/ui'`.

```typescript
// ─── MUI Material components ─────────────────────────────────────────────────
export { Alert } from '@mui/material';
export { AppBar } from '@mui/material';
export { Autocomplete, autocompleteClasses } from '@mui/material';
export { Avatar } from '@mui/material';
export { Badge } from '@mui/material';
export { Box } from '@mui/material';
export { Button } from '@mui/material';
export { ButtonBase } from '@mui/material';
export { Card, CardContent, CardHeader } from '@mui/material';
export { Checkbox } from '@mui/material';
export { ClickAwayListener } from '@mui/material';
export { Container } from '@mui/material';
export { CssBaseline } from '@mui/material';
export { Divider } from '@mui/material';
export { Drawer, drawerClasses } from '@mui/material';
export { Fab } from '@mui/material';
export { FormControlLabel } from '@mui/material';
export { FormGroup } from '@mui/material';
export { GlobalStyles } from '@mui/material';
export { Grid } from '@mui/material';
export { IconButton } from '@mui/material';
export { Input } from '@mui/material';
export { InputAdornment } from '@mui/material';
export { LinearProgress, linearProgressClasses } from '@mui/material';
export { Link } from '@mui/material';
export { List, ListItem, ListItemAvatar, ListItemButton, ListItemText, ListSubheader } from '@mui/material';
export { MenuItem, menuItemClasses } from '@mui/material';
export { MenuList } from '@mui/material';
export { OutlinedInput } from '@mui/material';
export { Pagination } from '@mui/material';
export { Popover } from '@mui/material';
export { Radio, RadioGroup } from '@mui/material';
export { Rating } from '@mui/material';
export { Skeleton } from '@mui/material';
export { Slide } from '@mui/material';
export { Stack } from '@mui/material';
export { SvgIcon } from '@mui/material';
export { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from '@mui/material';
export { TextField } from '@mui/material';
export { Toolbar } from '@mui/material';
export { Tooltip } from '@mui/material';
export { Typography } from '@mui/material';

// ─── MUI Lab components ───────────────────────────────────────────────────────
export {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator,
} from '@mui/lab';

// ─── MUI styles utilities ─────────────────────────────────────────────────────
export { styled, alpha, useTheme } from '@mui/material/styles';

// ─── Custom components ────────────────────────────────────────────────────────
export * from './chart';
export * from './color-utils';
export * from './iconify';
export * from './label';
export * from './logo';
export * from './scrollbar';
export * from './svg-color';
export * from './layout-core';
```

- [ ] **Step 3: Verify**

```bash
pnpm tsc --noEmit
```

Expected: zero new errors.

- [ ] **Step 4: Commit**

```bash
git add src/shared/ui/
git commit -m "feat(shared): add ui layer (MUI re-exports + custom components + layout-core)"
```

---

## Task 6: Build `entities` Layer

**Files:**
- Create: `src/entities/user/model/types.ts`
- Create: `src/entities/user/ui/user-table-row.tsx`
- Create: `src/entities/user/index.ts`
- Create: `src/entities/product/model/types.ts`
- Create: `src/entities/product/ui/product-item.tsx`
- Create: `src/entities/product/index.ts`
- Create: `src/entities/post/model/types.ts`
- Create: `src/entities/post/ui/post-item.tsx`
- Create: `src/entities/post/index.ts`

- [ ] **Step 1: Create directories**

```bash
mkdir -p src/entities/user/{model,ui}
mkdir -p src/entities/product/{model,ui}
mkdir -p src/entities/post/{model,ui}
```

- [ ] **Step 2: Create `src/entities/user/model/types.ts`**

Extract `UserProps` from `src/sections/user/user-table-row.tsx`:

```typescript
export type UserProps = {
  id: string;
  name: string;
  role: string;
  status: string;
  company: string;
  avatarUrl: string;
  isVerified: boolean;
};
```

- [ ] **Step 3: Create `src/entities/user/ui/user-table-row.tsx`**

Same as `src/sections/user/user-table-row.tsx` with updated imports. The `UserProps` type is now in `model/types.ts`, and `UserProps` export is removed from this file:

```tsx
import { useState, useCallback } from 'react';

import {
  Box,
  Avatar,
  Popover,
  TableRow,
  Checkbox,
  MenuList,
  TableCell,
  IconButton,
  MenuItem,
  menuItemClasses,
} from '@shared/ui';

import { Label } from '@shared/ui';
import { Iconify } from '@shared/ui';

import type { UserProps } from '../model/types';

// ----------------------------------------------------------------------

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
};

export function UserTableRow({ row, selected, onSelectRow }: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar alt={row.name} src={row.avatarUrl} />
            {row.name}
          </Box>
        </TableCell>

        <TableCell>{row.company}</TableCell>
        <TableCell>{row.role}</TableCell>
        <TableCell align="center">
          {row.isVerified ? (
            <Iconify width={22} icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
          ) : (
            '-'
          )}
        </TableCell>

        <TableCell>
          <Label color={(row.status === 'banned' && 'error') || 'success'}>{row.status}</Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: { px: 1, gap: 2, borderRadius: 0.75 },
          }}
        >
          <MenuItem onClick={handleClosePopover}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
```

- [ ] **Step 4: Create `src/entities/user/index.ts`**

```typescript
export type { UserProps } from './model/types';
export { UserTableRow } from './ui/user-table-row';
```

- [ ] **Step 5: Create `src/entities/product/model/types.ts`**

Extract `ProductItemProps` from `src/sections/product/product-item.tsx`:

```typescript
export type ProductItemProps = {
  id: string;
  name: string;
  price: number;
  status: string;
  coverUrl: string;
  colors: string[];
  priceSale: number | null;
};
```

- [ ] **Step 6: Create `src/entities/product/ui/product-item.tsx`**

Same as `src/sections/product/product-item.tsx` with updated imports. Remove `ProductItemProps` definition (it's now in `model/types.ts`):

```tsx
import { Box, Link, Card, Stack, Typography } from '@shared/ui';

import { fCurrency } from '@shared/lib';

import { Label } from '@shared/ui';
import { ColorPreview } from '@shared/ui';

import type { ProductItemProps } from '../model/types';

// ----------------------------------------------------------------------

type Props = {
  product: ProductItemProps;
};

export function ProductItem({ product }: Props) {
  const { name, coverUrl, price, colors, status, priceSale } = product;

  const renderImg = (
    <Box
      component="img"
      alt={name}
      src={coverUrl}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  const renderPrice = (
    <Typography variant="subtitle1">
      <Typography
        component="span"
        variant="body1"
        sx={{ color: 'text.disabled', textDecoration: 'line-through' }}
      >
        {priceSale && fCurrency(priceSale)}
      </Typography>
      &nbsp;
      {fCurrency(price)}
    </Typography>
  );

  return (
    <Card>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {status && (
          <Label
            variant="inverted"
            color={(status === 'sale' && 'error') || 'info'}
            sx={{ zIndex: 9, top: 16, right: 16, position: 'absolute', textTransform: 'uppercase' }}
          >
            {status}
          </Label>
        )}
        {renderImg}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
          {name}
        </Link>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ColorPreview colors={colors} />
          {renderPrice}
        </Box>
      </Stack>
    </Card>
  );
}
```

- [ ] **Step 7: Create `src/entities/product/index.ts`**

```typescript
export type { ProductItemProps } from './model/types';
export { ProductItem } from './ui/product-item';
```

- [ ] **Step 8: Create `src/entities/post/model/types.ts`**

Extract `IPostItem` from `src/sections/blog/post-item.tsx`:

```typescript
import type { IconifyName } from '@shared/ui';

export type IPostItem = {
  id: string;
  title: string;
  coverUrl: string;
  totalViews: number;
  description: string;
  totalShares: number;
  totalComments: number;
  totalFavorites: number;
  postedAt: string | number | null;
  author: {
    name: string;
    avatarUrl: string;
  };
  favoritePerson: Array<{
    name: string;
    avatarUrl: string;
  }>;
  shareLinks?: {
    facebook?: IconifyName;
    instagram?: IconifyName;
    linkedin?: IconifyName;
    twitter?: IconifyName;
  };
};
```

- [ ] **Step 9: Create `src/entities/post/ui/post-item.tsx`**

Copy `src/sections/blog/post-item.tsx` and update imports:

```tsx
import type { CardProps } from '@mui/material/Card';

import { varAlpha } from 'minimal-shared/utils';

import { Box, Link, Card, Avatar, Typography } from '@shared/ui';

import { fDate } from '@shared/lib';
import { fShortenNumber } from '@shared/lib';

import { Iconify } from '@shared/ui';
import { SvgColor } from '@shared/ui';

import type { IPostItem } from '../model/types';

// ----------------------------------------------------------------------

type Props = CardProps & {
  post: IPostItem;
  index?: number;
};

export function PostItem({ post, index, sx, ...other }: Props) {
  const { coverUrl, title, totalFavorites, totalComments, totalShares, author, postedAt } = post;

  const latestPostLarge = index === 0;
  const latestPost = index === 1 || index === 2;

  const renderAvatar = (
    <Avatar
      alt={author.name}
      src={author.avatarUrl}
      sx={{
        zIndex: 9,
        width: 32,
        height: 32,
        position: 'absolute',
        left: (theme) => theme.spacing(3),
        bottom: (theme) => theme.spacing(-2),
        ...((latestPostLarge || latestPost) && { zIndex: 9, top: 24, left: 24 }),
      }}
    />
  );

  const renderTitle = (
    <Link
      color="inherit"
      variant="subtitle2"
      underline="hover"
      sx={{
        overflow: 'hidden',
        WebkitLineClamp: 2,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        ...(latestPostLarge && { typography: 'h5', height: 60 }),
        ...((latestPostLarge || latestPost) && { color: 'common.white' }),
      }}
    >
      {title}
    </Link>
  );

  const renderInfo = (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        color: 'text.disabled',
        justifyContent: 'flex-end',
        ...((latestPostLarge || latestPost) && { opacity: 0.48, color: 'common.white' }),
      }}
    >
      {[
        { number: totalComments, icon: 'solar:chat-round-dots-bold' },
        { number: totalViews, icon: 'solar:eye-bold' },
        { number: totalShares, icon: 'solar:share-bold' },
        { number: totalFavorites, icon: 'solar:heart-bold' },
      ].map((info, _index) => (
        <Box
          key={_index}
          sx={{ display: 'flex', alignItems: 'center', ml: _index === 0 ? 0 : 1.5 }}
        >
          <Iconify width={16} icon={info.icon as any} sx={{ mr: 0.5 }} />
          <Typography variant="caption">{fShortenNumber(info.number)}</Typography>
        </Box>
      ))}
    </Box>
  );

  const renderCover = (
    <Box
      component="img"
      alt={title}
      src={coverUrl}
      sx={{
        top: 0, width: 1, height: 1, objectFit: 'cover', position: 'absolute',
      }}
    />
  );

  const renderDate = (
    <Typography
      variant="caption"
      component="div"
      sx={{ mb: 1, color: 'text.disabled', ...((latestPostLarge || latestPost) && { opacity: 0.48, color: 'common.white' }) }}
    >
      {fDate(postedAt)}
    </Typography>
  );

  const renderShape = (
    <SvgColor
      width={88}
      height={36}
      src="/assets/icons/shape-avatar.svg"
      sx={{
        left: 0,
        zIndex: 9,
        bottom: -15,
        position: 'absolute',
        color: 'background.paper',
        ...((latestPostLarge || latestPost) && { display: 'none' }),
      }}
    />
  );

  return (
    <Card sx={[{ position: 'relative' }, ...(Array.isArray(sx) ? sx : [sx])] as any} {...other}>
      <Box
        sx={[
          (theme) => ({
            position: 'relative',
            pt: 'calc(100% * 3 / 4)',
            ...((latestPostLarge || latestPost) && {
              pt: 'calc(100% * 4 / 3)',
              '&:after': {
                top: 0, content: "''", width: '100%', height: '100%',
                position: 'absolute',
                bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.72),
              },
            }),
            ...(latestPostLarge && {
              pt: { xs: 'calc(100% * 4 / 3)', sm: 'calc(100% * 3 / 4.66)' },
            }),
          }),
        ]}
      >
        {renderShape}
        {renderAvatar}
        {renderCover}
      </Box>

      <Box
        sx={{
          p: (theme) => theme.spacing(4, 3, 3, 3),
          ...((latestPostLarge || latestPost) && {
            width: 1,
            bottom: 0,
            position: 'absolute',
          }),
        }}
      >
        {renderDate}
        {renderTitle}
        {renderInfo}
      </Box>
    </Card>
  );
}
```

> **Note:** `totalViews` is accessed in `renderInfo` — ensure it's destructured from `post`. Add `totalViews` to the destructuring: `const { coverUrl, title, totalViews, totalFavorites, totalComments, totalShares, author, postedAt } = post;`

- [ ] **Step 10: Create `src/entities/post/index.ts`**

```typescript
export type { IPostItem } from './model/types';
export { PostItem } from './ui/post-item';
```

- [ ] **Step 11: Verify**

```bash
pnpm tsc --noEmit
```

Expected: zero new errors.

- [ ] **Step 12: Commit**

```bash
git add src/entities/
git commit -m "feat(entities): add user, product, post entity slices"
```

---

## Task 7: Build `features` Layer

**Files:**
- Create: `src/features/auth/ui/sign-in-view.tsx`
- Create: `src/features/auth/index.ts`
- Create: `src/features/user-management/lib/use-table.ts`
- Create: `src/features/user-management/lib/utils.ts`
- Create: `src/features/user-management/ui/user-table-toolbar.tsx`
- Create: `src/features/user-management/ui/user-table-head.tsx`
- Create: `src/features/user-management/ui/table-empty-rows.tsx`
- Create: `src/features/user-management/ui/table-no-data.tsx`
- Create: `src/features/user-management/index.ts`
- Create: `src/features/product-catalog/ui/product-filters.tsx`
- Create: `src/features/product-catalog/ui/product-sort.tsx`
- Create: `src/features/product-catalog/ui/product-cart-widget.tsx`
- Create: `src/features/product-catalog/index.ts`
- Create: `src/features/blog/ui/post-search.tsx`
- Create: `src/features/blog/ui/post-sort.tsx`
- Create: `src/features/blog/index.ts`

- [ ] **Step 1: Create directories**

```bash
mkdir -p src/features/auth/ui
mkdir -p src/features/user-management/{lib,ui}
mkdir -p src/features/product-catalog/ui
mkdir -p src/features/blog/ui
```

- [ ] **Step 2: Create `src/features/auth/ui/sign-in-view.tsx`**

Copy `src/sections/auth/sign-in-view.tsx` and update imports:

Replace:
- `from 'src/routes/hooks'` → `from '@shared/router'`
- `from 'src/components/iconify'` → `from '@shared/ui'`
- All `from '@mui/material/...'` → `from '@shared/ui'` (Box, Link, Button, Divider, TextField, IconButton, Typography, InputAdornment)

The function body is unchanged. Show only the updated import block at the top:

```tsx
import { useState, useCallback } from 'react';

import {
  Box,
  Link,
  Button,
  Divider,
  TextField,
  IconButton,
  Typography,
  InputAdornment,
} from '@shared/ui';

import { useRouter } from '@shared/router';

import { Iconify } from '@shared/ui';
```

(Remainder of the file is identical to `src/sections/auth/sign-in-view.tsx`.)

- [ ] **Step 3: Create `src/features/auth/index.ts`**

```typescript
export { SignInView } from './ui/sign-in-view';
```

- [ ] **Step 4: Extract `useTable` to `src/features/user-management/lib/use-table.ts`**

```typescript
import { useState, useCallback } from 'react';

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) { setSelected(newSelecteds); return; }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];
      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => { setPage(0); }, []);

  const onChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page, order, onSort, orderBy, selected, rowsPerPage,
    onSelectRow, onResetPage, onChangePage, onSelectAllRows, onChangeRowsPerPage,
  };
}
```

- [ ] **Step 5: Copy `src/sections/user/utils.ts` → `src/features/user-management/lib/utils.ts`**

No import changes needed (pure functions with no internal imports).

- [ ] **Step 6: Create user-management UI files**

For each of the following, copy from `src/sections/user/` and update imports:
- `from '@mui/material/...'` → `from '@shared/ui'`
- `from 'src/components/iconify'` → `from '@shared/ui'`
- `from 'src/components/label'` → `from '@shared/ui'`
- Relative sibling imports stay relative

**`src/features/user-management/ui/user-table-toolbar.tsx`** — updated import block:

```tsx
import { OutlinedInput, InputAdornment, Toolbar, Typography } from '@shared/ui';
import { Iconify } from '@shared/ui';
```

(Remainder identical to `src/sections/user/user-table-toolbar.tsx`.)

**`src/features/user-management/ui/user-table-head.tsx`** — updated import block:

```tsx
import { Box, Checkbox, TableRow, TableCell, TableHead, TableSortLabel } from '@shared/ui';
```

(Remainder identical to `src/sections/user/user-table-head.tsx`.)

**`src/features/user-management/ui/table-empty-rows.tsx`** — updated import block:

```tsx
import { TableRow, TableCell } from '@shared/ui';
```

(Remainder identical to `src/sections/user/table-empty-rows.tsx`.)

**`src/features/user-management/ui/table-no-data.tsx`** — updated import block:

```tsx
import { Box, TableRow, TableCell, Typography } from '@shared/ui';
import type { TableRowProps } from '@mui/material/TableRow';
```

(Remainder identical to `src/sections/user/table-no-data.tsx`. The file uses `Box`, `TableRow`, `TableCell`, `Typography` — no `Paper` is used.)

- [ ] **Step 7: Create `src/features/user-management/index.ts`**

```typescript
export { useTable } from './lib/use-table';
export { emptyRows, applyFilter, getComparator } from './lib/utils';
export { UserTableToolbar } from './ui/user-table-toolbar';
export { UserTableHead } from './ui/user-table-head';
export { TableEmptyRows } from './ui/table-empty-rows';
export { TableNoData } from './ui/table-no-data';
```

- [ ] **Step 8: Create product-catalog UI files**

For each, copy from `src/sections/product/` and update:
- `from '@mui/material/...'` → `from '@shared/ui'`
- `from 'src/components/...'` → `from '@shared/ui'`
- `from 'src/utils/...'` → `from '@shared/lib'`
- `from '../product-item'` → `from '@entities/product'`

**`src/features/product-catalog/ui/product-filters.tsx`** — updated imports:

```tsx
import { Box, Radio, Stack, Button, Drawer, Divider, Checkbox, FormGroup, RadioGroup, Typography, FormControlLabel } from '@shared/ui';
import { Iconify } from '@shared/ui';
import { Scrollbar } from '@shared/ui';
```

**`src/features/product-catalog/ui/product-sort.tsx`** — updated imports:

```tsx
import { Button, MenuList, MenuItem, menuItemClasses } from '@shared/ui';
import { Iconify } from '@shared/ui';
import { usePopover, CustomPopover } from 'minimal-shared/components';
```

> Note: Check if `usePopover`/`CustomPopover` come from `minimal-shared`. If not, adapt to match the original file exactly.

**`src/features/product-catalog/ui/product-cart-widget.tsx`** — updated imports:

```tsx
import { Box, Badge, IconButton } from '@shared/ui';
import { Iconify } from '@shared/ui';
```

- [ ] **Step 9: Create `src/features/product-catalog/index.ts`**

```typescript
export { ProductFilters } from './ui/product-filters';
export { ProductSort } from './ui/product-sort';
export { CartIcon } from './ui/product-cart-widget';

export type { FiltersProps } from './ui/product-filters';
```

- [ ] **Step 10: Create blog UI files**

**`src/features/blog/ui/post-search.tsx`** — copy `src/sections/blog/post-search.tsx`, update:
```tsx
import { Autocomplete, TextField, autocompleteClasses } from '@shared/ui';
import type { IPostItem } from '@entities/post';
```

Also replace the internal sibling import `from './post-item'` with `from '@entities/post'`.

**`src/features/blog/ui/post-sort.tsx`** — copy `src/sections/blog/post-sort.tsx`, update:
```tsx
import { Button, MenuList, MenuItem, menuItemClasses } from '@shared/ui';
import { Iconify } from '@shared/ui';
```

- [ ] **Step 11: Create `src/features/blog/index.ts`**

```typescript
export { PostSearch } from './ui/post-search';
export { PostSort } from './ui/post-sort';
```

- [ ] **Step 12: Verify**

```bash
pnpm tsc --noEmit
```

Expected: zero new errors.

- [ ] **Step 13: Commit**

```bash
git add src/features/
git commit -m "feat(features): add auth, user-management, product-catalog, blog slices"
```

---

## Task 8: Build `widgets` Layer

**Files:**
- Create: `src/widgets/analytics/ui/` (9 files from `src/sections/overview/`)
- Create: `src/widgets/analytics/index.ts`
- Create: `src/widgets/dashboard-layout/model/` (3 nav-config files)
- Create: `src/widgets/dashboard-layout/ui/` (layout + nav + content + 7 component files)
- Create: `src/widgets/dashboard-layout/index.ts`
- Create: `src/widgets/auth-layout/ui/` (layout + content)
- Create: `src/widgets/auth-layout/index.ts`

- [ ] **Step 1: Create directories**

```bash
mkdir -p src/widgets/analytics/ui
mkdir -p src/widgets/dashboard-layout/{model,ui}
mkdir -p src/widgets/auth-layout/ui
```

- [ ] **Step 2: Create analytics widget files**

For each of the 9 files in `src/sections/overview/` (excluding `view/`), copy to `src/widgets/analytics/ui/` and update:
- `from '@mui/material/...'` → `from '@shared/ui'`
- `from '@mui/lab/...'` → `from '@shared/ui'`
- `from 'src/components/chart'` → `from '@shared/ui'`
- `from 'src/_mock'` → `from '@shared/api'`

Files: `analytics-news.tsx`, `analytics-conversion-rates.tsx`, `analytics-tasks.tsx`, `analytics-traffic-by-site.tsx`, `analytics-website-visits.tsx`, `analytics-order-timeline.tsx`, `analytics-current-subject.tsx`, `analytics-widget-summary.tsx`, `analytics-current-visits.tsx`

Also check for `from 'src/components/label'` or `from 'src/components/color-utils'` and replace with `from '@shared/ui'`.

- [ ] **Step 3: Create `src/widgets/analytics/index.ts`**

```typescript
export { AnalyticsNews } from './ui/analytics-news';
export { AnalyticsConversionRates } from './ui/analytics-conversion-rates';
export { AnalyticsTasks } from './ui/analytics-tasks';
export { AnalyticsTrafficBySite } from './ui/analytics-traffic-by-site';
export { AnalyticsWebsiteVisits } from './ui/analytics-website-visits';
export { AnalyticsOrderTimeline } from './ui/analytics-order-timeline';
export { AnalyticsCurrentSubject } from './ui/analytics-current-subject';
export { AnalyticsWidgetSummary } from './ui/analytics-widget-summary';
export { AnalyticsCurrentVisits } from './ui/analytics-current-visits';
```

- [ ] **Step 4: Create dashboard-layout model files**

Copy `src/layouts/nav-config-dashboard.tsx` → `src/widgets/dashboard-layout/model/nav-config-dashboard.tsx`.

Update imports:
- `from 'src/components/label'` → `from '@shared/ui'`
- `from 'src/components/svg-color'` → `from '@shared/ui'`

Copy `src/layouts/nav-config-account.tsx` → `src/widgets/dashboard-layout/model/nav-config-account.tsx`.

Update imports:
- `from './components/account-popover'` → `from '../ui/account-popover'`

Copy `src/layouts/nav-config-workspace.tsx` → `src/widgets/dashboard-layout/model/nav-config-workspace.tsx`.

Update imports:
- `from './components/workspaces-popover'` → `from '../ui/workspaces-popover'`

- [ ] **Step 5: Copy dashboard-layout UI components**

For each file in `src/layouts/components/` (`account-popover.tsx`, `language-popover.tsx`, `menu-button.tsx`, `nav-upgrade.tsx`, `notifications-popover.tsx`, `searchbar.tsx`, `workspaces-popover.tsx`), copy to `src/widgets/dashboard-layout/ui/` and update:
- `from 'src/routes/hooks'` → `from '@shared/router'`
- `from 'src/routes/components'` → `from '@shared/router'`
- `from 'src/_mock'` → `from '@shared/api'`
- `from 'src/components/...'` → `from '@shared/ui'`
- `from '@mui/material/...'` → `from '@shared/ui'`
- Relative imports to sibling files stay relative (e.g., `from './workspaces-popover'`)

- [ ] **Step 6: Copy dashboard content and nav**

Copy `src/layouts/dashboard/content.tsx` → `src/widgets/dashboard-layout/ui/content.tsx`.

Update imports:
- `from '../core/classes'` → `from '@shared/ui'`
- `from '@mui/material/Container'` → `from '@shared/ui'`

Copy `src/layouts/dashboard/nav.tsx` → `src/widgets/dashboard-layout/ui/nav.tsx`.

Update imports:
- `from '@mui/material/...'` → `from '@shared/ui'`
- `from 'src/routes/hooks'` → `from '@shared/router'`
- `from 'src/routes/components'` → `from '@shared/router'`
- `from 'src/components/logo'` → `from '@shared/ui'`
- `from 'src/components/scrollbar'` → `from '@shared/ui'`
- `from '../components/nav-upgrade'` → `from './nav-upgrade'`
- `from '../components/workspaces-popover'` → `from './workspaces-popover'`
- `from '../nav-config-dashboard'` → `from '../model/nav-config-dashboard'`

Copy `src/layouts/dashboard/css-vars.ts` → `src/widgets/dashboard-layout/ui/css-vars.ts` (no import changes — only imports `@mui/material/styles` types).

Copy `src/layouts/dashboard/layout.tsx` → `src/widgets/dashboard-layout/ui/layout.tsx`.

Update imports:
- `from '@mui/material/...'` → `from '@shared/ui'`
- `from 'src/_mock'` → `from '@shared/api'`
- `from '../core/...'` (classes, main-section, header-section, layout-section) → `from '@shared/ui'`
- `from './nav'` → keep (relative, stays valid)
- `from '../components/...'` → `from './account-popover'`, `from './searchbar'`, etc. (relative to `ui/`)
- `from '../nav-config-account'` → `from '../model/nav-config-account'`
- `from '../nav-config-dashboard'` → `from '../model/nav-config-dashboard'`
- `from '../nav-config-workspace'` → `from '../model/nav-config-workspace'`
- `from './css-vars'` → keep (relative)

- [ ] **Step 7: Create `src/widgets/dashboard-layout/index.ts`**

```typescript
export { DashboardLayout } from './ui/layout';
export { DashboardContent } from './ui/content';
```

- [ ] **Step 8: Create auth-layout files**

Copy `src/layouts/auth/content.tsx` → `src/widgets/auth-layout/ui/content.tsx` (no import changes — pure MUI + styled).

Update imports:
- `from '@mui/material/...'` → `from '@shared/ui'`
- `from '@mui/material/styles'` (styled) → `from '@shared/ui'`

Copy `src/layouts/auth/layout.tsx` → `src/widgets/auth-layout/ui/layout.tsx`.

Update imports:
- `from '@mui/material/...'` → `from '@shared/ui'`
- `from 'src/routes/components'` → `from '@shared/router'`
- `from 'src/components/logo'` → `from '@shared/ui'`
- `from '../core/...'` → `from '@shared/ui'`
- `from './content'` → keep (relative)

- [ ] **Step 9: Create `src/widgets/auth-layout/index.ts`**

```typescript
export { AuthLayout } from './ui/layout';
```

- [ ] **Step 10: Verify**

```bash
pnpm tsc --noEmit
```

Expected: zero new errors.

- [ ] **Step 11: Commit**

```bash
git add src/widgets/
git commit -m "feat(widgets): add analytics, dashboard-layout, auth-layout slices"
```

---

## Task 9: Build `pages` Layer

**Files:**
- Create: `src/pages/dashboard/ui/overview-analytics-view.tsx`
- Create: `src/pages/dashboard/index.tsx`
- Create: `src/pages/user/ui/user-view.tsx`
- Create: `src/pages/user/index.tsx`
- Create: `src/pages/products/ui/products-view.tsx`
- Create: `src/pages/products/index.tsx`
- Create: `src/pages/blog/ui/blog-view.tsx`
- Create: `src/pages/blog/index.tsx`
- Create: `src/pages/sign-in/index.tsx`
- Create: `src/pages/not-found/ui/not-found-view.tsx`
- Create: `src/pages/not-found/index.tsx`

- [ ] **Step 1: Create directories**

```bash
mkdir -p src/pages/dashboard/ui
mkdir -p src/pages/user/ui
mkdir -p src/pages/products/ui
mkdir -p src/pages/blog/ui
mkdir -p src/pages/sign-in
mkdir -p src/pages/not-found/ui
```

- [ ] **Step 2: Create `src/pages/dashboard/ui/overview-analytics-view.tsx`**

Copy `src/sections/overview/view/overview-analytics-view.tsx` and update:

```tsx
import { Grid, Typography } from '@shared/ui';

import { DashboardContent } from '@widgets/dashboard-layout';
import { _posts, _tasks, _traffic, _timeline } from '@shared/api';

import {
  AnalyticsNews,
  AnalyticsTasks,
  AnalyticsCurrentVisits,
  AnalyticsOrderTimeline,
  AnalyticsWebsiteVisits,
  AnalyticsWidgetSummary,
  AnalyticsTrafficBySite,
  AnalyticsCurrentSubject,
  AnalyticsConversionRates,
} from '@widgets/analytics';
```

(Function body is unchanged.)

- [ ] **Step 3: Create `src/pages/dashboard/index.tsx`**

```tsx
import { CONFIG } from '@shared/config';

import { OverviewAnalyticsView } from './ui/overview-analytics-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Dashboard - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="The starting point for your next project with Minimal UI Kit, built on the newest version of Material-UI ©, ready to be customized to your style"
      />
      <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />
      <OverviewAnalyticsView />
    </>
  );
}
```

- [ ] **Step 4: Create `src/pages/user/ui/user-view.tsx`**

Copy `src/sections/user/view/user-view.tsx` and update imports. Remove the `useTable` definition (now in `features/user-management`):

```tsx
import { useState } from 'react';

import {
  Box,
  Card,
  Table,
  Button,
  TableBody,
  Typography,
  TableContainer,
  TablePagination,
} from '@shared/ui';

import { _users } from '@shared/api';
import { DashboardContent } from '@widgets/dashboard-layout';

import { Iconify } from '@shared/ui';
import { Scrollbar } from '@shared/ui';

import { UserTableRow } from '@entities/user';
import type { UserProps } from '@entities/user';

import {
  useTable,
  emptyRows,
  applyFilter,
  getComparator,
  TableNoData,
  UserTableHead,
  TableEmptyRows,
  UserTableToolbar,
} from '@features/user-management';

// ----------------------------------------------------------------------

export function UserView() {
  const table = useTable();
  const [filterName, setFilterName] = useState('');

  const dataFiltered: UserProps[] = applyFilter({
    inputData: _users,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Users
        </Typography>
        <Button variant="contained" color="inherit" startIcon={<Iconify icon="mingcute:add-line" />}>
          New user
        </Button>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={_users.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(checked, _users.map((user) => user.id))
                }
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'company', label: 'Company' },
                  { id: 'role', label: 'Role' },
                  { id: 'isVerified', label: 'Verified', align: 'center' },
                  { id: 'status', label: 'Status' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                    />
                  ))}
                <TableEmptyRows height={68} emptyRows={emptyRows(table.page, table.rowsPerPage, _users.length)} />
                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={_users.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}
```

- [ ] **Step 5: Create `src/pages/user/index.tsx`**

```tsx
import { CONFIG } from '@shared/config';

import { UserView } from './ui/user-view';

export default function Page() {
  return (
    <>
      <title>{`Users - ${CONFIG.appName}`}</title>
      <UserView />
    </>
  );
}
```

- [ ] **Step 6: Create `src/pages/products/ui/products-view.tsx`**

Copy `src/sections/product/view/products-view.tsx` and update:

```tsx
import { useState, useCallback } from 'react';

import {
  Box,
  Grid,
  Pagination,
  Typography,
} from '@shared/ui';

import { _products } from '@shared/api';
import { DashboardContent } from '@widgets/dashboard-layout';

import { ProductItem } from '@entities/product';
import type { ProductItemProps } from '@entities/product';

import {
  CartIcon,
  ProductSort,
  ProductFilters,
} from '@features/product-catalog';
import type { FiltersProps } from '@features/product-catalog';
```

(Constants `GENDER_OPTIONS`, `CATEGORY_OPTIONS`, `RATING_OPTIONS`, `PRICE_RANGE_OPTIONS`, `COLOR_OPTIONS`, `SORT_OPTIONS`, and the `ProductsView` function body are unchanged.)

- [ ] **Step 7: Create `src/pages/products/index.tsx`**

```tsx
import { CONFIG } from '@shared/config';

import { ProductsView } from './ui/products-view';

export default function Page() {
  return (
    <>
      <title>{`Products - ${CONFIG.appName}`}</title>
      <ProductsView />
    </>
  );
}
```

- [ ] **Step 8: Create `src/pages/blog/ui/blog-view.tsx`**

Copy `src/sections/blog/view/blog-view.tsx` and update:

```tsx
import { useState, useCallback } from 'react';

import { Box, Grid, Button, Typography, Pagination } from '@shared/ui';

import { DashboardContent } from '@widgets/dashboard-layout';

import { Iconify } from '@shared/ui';

import { PostItem } from '@entities/post';
import type { IPostItem } from '@entities/post';

import { PostSort, PostSearch } from '@features/blog';
```

(Function body unchanged.)

- [ ] **Step 9: Create `src/pages/blog/index.tsx`**

```tsx
import { _posts } from '@shared/api';
import { CONFIG } from '@shared/config';

import { BlogView } from './ui/blog-view';

export default function Page() {
  return (
    <>
      <title>{`Blog - ${CONFIG.appName}`}</title>
      <BlogView posts={_posts} />
    </>
  );
}
```

- [ ] **Step 10: Create `src/pages/sign-in/index.tsx`**

```tsx
import { CONFIG } from '@shared/config';

import { SignInView } from '@features/auth';

export default function Page() {
  return (
    <>
      <title>{`Sign in - ${CONFIG.appName}`}</title>
      <SignInView />
    </>
  );
}
```

- [ ] **Step 11: Create `src/pages/not-found/ui/not-found-view.tsx`**

Copy `src/sections/error/not-found-view.tsx` and update:

```tsx
import { Box, Button, Container, Typography } from '@shared/ui';

import { RouterLink } from '@shared/router';
import { Logo } from '@shared/ui';
```

(Function body unchanged.)

- [ ] **Step 12: Create `src/pages/not-found/index.tsx`**

```tsx
import { CONFIG } from '@shared/config';

import { NotFoundView } from './ui/not-found-view';

export default function Page() {
  return (
    <>
      <title>{`404 page not found! | Error - ${CONFIG.appName}`}</title>
      <NotFoundView />
    </>
  );
}
```

- [ ] **Step 13: Verify**

```bash
pnpm tsc --noEmit
```

Expected: zero new errors.

- [ ] **Step 14: Commit**

```bash
git add src/pages/
git commit -m "feat(pages): add all 6 page slices with FSD-compliant imports"
```

---

## Task 10: Build `app` Layer

**Files:**
- Create: `src/app/styles/global.css`
- Create: `src/app/providers.tsx`
- Create: `src/app/router/sections.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create app directories**

```bash
mkdir -p src/app/styles src/app/router
```

- [ ] **Step 2: Copy `src/global.css` → `src/app/styles/global.css`**

```bash
cp src/global.css src/app/styles/global.css
```

No changes needed (plain CSS, no imports).

- [ ] **Step 3: Create `src/app/providers.tsx`**

```tsx
import '@app/styles/global.css';

import { useEffect } from 'react';

import { Fab } from '@shared/ui';
import { ThemeProvider } from '@shared/theme';
import { usePathname } from '@shared/router';
import { Iconify } from '@shared/ui';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  const githubButton = () => (
    <Fab
      size="medium"
      aria-label="Github"
      href="https://github.com/minimal-ui-kit/material-kit-react"
      sx={{
        zIndex: 9,
        right: 20,
        bottom: 20,
        width: 48,
        height: 48,
        position: 'fixed',
        bgcolor: 'grey.800',
      }}
    >
      <Iconify width={24} icon="socials:github" sx={{ '--color': 'white' }} />
    </Fab>
  );

  return (
    <ThemeProvider>
      {children}
      {githubButton()}
    </ThemeProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
```

- [ ] **Step 4: Create `src/app/router/sections.tsx`**

```tsx
import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import { Box, LinearProgress, linearProgressClasses } from '@shared/ui';

import { AuthLayout } from '@widgets/auth-layout';
import { DashboardLayout } from '@widgets/dashboard-layout';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('@pages/dashboard'));
export const BlogPage = lazy(() => import('@pages/blog'));
export const UserPage = lazy(() => import('@pages/user'));
export const SignInPage = lazy(() => import('@pages/sign-in'));
export const ProductsPage = lazy(() => import('@pages/products'));
export const Page404 = lazy(() => import('@pages/not-found'));

const renderFallback = () => (
  <Box sx={{ display: 'flex', flex: '1 1 auto', alignItems: 'center', justifyContent: 'center' }}>
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    element: (
      <DashboardLayout>
        <Suspense fallback={renderFallback()}>
          <Outlet />
        </Suspense>
      </DashboardLayout>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'user', element: <UserPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'blog', element: <BlogPage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  { path: '404', element: <Page404 /> },
  { path: '*', element: <Page404 /> },
];
```

- [ ] **Step 5: Update `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router';

import App from '@app/providers';
import { routesSection } from '@app/router/sections';
import { ErrorBoundary } from '@shared/router';

// ----------------------------------------------------------------------

const router = createBrowserRouter([
  {
    Component: () => (
      <App>
        <Outlet />
      </App>
    ),
    errorElement: <ErrorBoundary />,
    children: routesSection,
  },
]);

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

- [ ] **Step 6: Verify the app runs**

```bash
pnpm dev
```

Open `http://localhost:3039`. Expected: app loads and all pages navigate correctly. Check:
- `/` — Dashboard with analytics charts
- `/user` — User table
- `/products` — Products grid
- `/blog` — Blog posts
- `/sign-in` — Sign-in form
- `/404` — Not Found page

- [ ] **Step 7: Commit**

```bash
git add src/app/ src/main.tsx
git commit -m "feat(app): add app layer and wire up FSD structure"
```

---

## Task 11: Remove Old Source Structure

> **Warning:** This step deletes all old files. Ensure Task 10 Step 6 (dev server) passed before proceeding.

**Files:**
- Delete: `src/pages/` (old page files)
- Delete: `src/sections/`
- Delete: `src/layouts/`
- Delete: `src/routes/`
- Delete: `src/theme/`
- Delete: `src/_mock/`
- Delete: `src/utils/`
- Delete: `src/components/`
- Delete: `src/config-global.ts`
- Delete: `src/app.tsx`
- Delete: `src/global.css`
- Modify: `vite.config.ts` (remove legacy `src/` alias)

- [ ] **Step 1: Remove old directories and files**

```bash
rm -rf src/pages src/sections src/layouts src/routes src/theme src/_mock src/utils src/components
rm src/config-global.ts src/app.tsx src/global.css
```

- [ ] **Step 2: Remove legacy `src/` alias from `vite.config.ts`**

Remove the last entry from the alias array:

```typescript
// vite.config.ts — remove this entry:
// { find: /^src(.+)/, replacement: path.resolve(process.cwd(), 'src/$1') },
```

Final `resolve.alias` in `vite.config.ts`:
```typescript
resolve: {
  alias: [
    { find: '@app',      replacement: path.resolve(process.cwd(), 'src/app') },
    { find: '@pages',    replacement: path.resolve(process.cwd(), 'src/pages') },
    { find: '@widgets',  replacement: path.resolve(process.cwd(), 'src/widgets') },
    { find: '@features', replacement: path.resolve(process.cwd(), 'src/features') },
    { find: '@entities', replacement: path.resolve(process.cwd(), 'src/entities') },
    { find: '@shared',   replacement: path.resolve(process.cwd(), 'src/shared') },
  ],
},
```

- [ ] **Step 3: Verify TypeScript still compiles**

```bash
pnpm tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Verify app still runs**

```bash
pnpm dev
```

Expected: all pages work as before.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove old source structure, complete FSD migration"
```

---

## Task 12: Configure ESLint Boundaries

**Files:**
- Modify: `eslint.config.mjs`

- [ ] **Step 1: Install `eslint-plugin-boundaries`**

```bash
pnpm add -D eslint-plugin-boundaries
```

Expected output: `packages installed` with no warnings.

- [ ] **Step 2: Update `eslint.config.mjs`**

Add `boundaries` plugin and rules to `eslint.config.mjs`. Add after existing imports:

```javascript
import boundaries from 'eslint-plugin-boundaries';
```

Add `boundariesConfig` alongside `customConfig`:

```javascript
export const boundariesConfig = {
  plugins: { boundaries },
  settings: {
    'boundaries/elements': [
      { type: 'app',      pattern: ['src/app/**'] },
      { type: 'pages',    pattern: ['src/pages/**'] },
      { type: 'widgets',  pattern: ['src/widgets/**'] },
      { type: 'features', pattern: ['src/features/**'] },
      { type: 'entities', pattern: ['src/entities/**'] },
      { type: 'shared',   pattern: ['src/shared/**'] },
    ],
    'boundaries/ignore': ['**/*.test.*', '**/*.spec.*'],
  },
  rules: {
    'boundaries/element-types': [
      2,
      {
        default: 'disallow',
        rules: [
          { from: 'app',      allow: ['pages', 'widgets', 'features', 'entities', 'shared'] },
          { from: 'pages',    allow: ['widgets', 'features', 'entities', 'shared'] },
          { from: 'widgets',  allow: ['features', 'entities', 'shared'] },
          { from: 'features', allow: ['entities', 'shared'] },
          { from: 'entities', allow: ['shared'] },
          { from: 'shared',   allow: [] },
        ],
      },
    ],
  },
};
```

Add `boundariesConfig` to the default export array:

```javascript
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { ignores: ['*', '!src/', '!eslint.config.*'] },
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    settings: { react: { version: 'detect' } },
  },
  eslintJs.configs.recommended,
  ...eslintTs.configs.recommended,
  reactPlugin.configs.flat.recommended,
  customConfig,
  boundariesConfig,   // ← added
];
```

- [ ] **Step 3: Run lint to check boundary violations**

```bash
pnpm lint
```

Expected: zero `boundaries/element-types` violations. If violations exist, the import is incorrect — fix the file that has the wrong import direction.

- [ ] **Step 4: Commit**

```bash
git add eslint.config.mjs package.json pnpm-lock.yaml
git commit -m "build: add eslint-plugin-boundaries for FSD layer enforcement"
```

---

## Task 13: Update ESLint Sort-Imports Patterns

**Files:**
- Modify: `eslint.config.mjs`

The `perfectionist/sort-imports` rule currently uses `internalPattern: ['^src/.+']` and old custom groups for `src/routes`, `src/sections`, etc. Update to match the new FSD `@layer` aliases.

- [ ] **Step 1: Update `sortImportsRules` in `eslint.config.mjs`**

Replace the `customGroups` and `perfectionist/sort-imports` config inside `sortImportsRules()`:

```javascript
const sortImportsRules = () => {
  const customGroups = {
    mui:      ['custom-mui'],
    shared:   ['custom-shared'],
    entities: ['custom-entities'],
    features: ['custom-features'],
    widgets:  ['custom-widgets'],
    pages:    ['custom-pages'],
    app:      ['custom-app'],
  };

  return {
    'perfectionist/sort-named-imports': [1, { type: 'line-length', order: 'asc' }],
    'perfectionist/sort-named-exports': [1, { type: 'line-length', order: 'asc' }],
    'perfectionist/sort-exports': [1, { order: 'asc', type: 'line-length', groupKind: 'values-first' }],
    'perfectionist/sort-imports': [
      2,
      {
        order: 'asc',
        ignoreCase: true,
        type: 'line-length',
        environment: 'node',
        maxLineLength: undefined,
        newlinesBetween: 'always',
        internalPattern: ['^@(app|pages|widgets|features|entities|shared)/.+'],
        groups: [
          'style',
          'side-effect',
          'type',
          ['builtin', 'external'],
          customGroups.mui,
          customGroups.shared,
          customGroups.entities,
          customGroups.features,
          customGroups.widgets,
          customGroups.pages,
          customGroups.app,
          'internal',
          ['parent', 'sibling', 'index'],
          ['parent-type', 'sibling-type', 'index-type'],
          'object',
          'unknown',
        ],
        customGroups: {
          value: {
            [customGroups.mui]:      ['^@mui/.+'],
            [customGroups.shared]:   ['^@shared/.+'],
            [customGroups.entities]: ['^@entities/.+'],
            [customGroups.features]: ['^@features/.+'],
            [customGroups.widgets]:  ['^@widgets/.+'],
            [customGroups.pages]:    ['^@pages/.+'],
            [customGroups.app]:      ['^@app/.+'],
          },
        },
      },
    ],
  };
};
```

- [ ] **Step 2: Run lint:fix to auto-sort imports**

```bash
pnpm lint:fix
```

Expected: import groups in all files reordered correctly. No errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "build: update ESLint sort-imports to use FSD layer groups"
```

---

## Task 14: Final Verification

- [ ] **Step 1: TypeScript strict check**

```bash
pnpm tsc --noEmit
```

Expected: **0 errors**.

- [ ] **Step 2: Full lint pass**

```bash
pnpm lint
```

Expected: **0 errors** (warnings are acceptable). Specifically confirm zero `boundaries/element-types` violations.

- [ ] **Step 3: Production build**

```bash
pnpm build
```

Expected: build completes with output in `dist/`. No TypeScript or bundle errors.

- [ ] **Step 4: Manual smoke test**

```bash
pnpm dev
```

Open `http://localhost:3039` and verify:
- `/` — Dashboard loads with all 9 analytics charts visible
- `/user` — User table renders, filter works, pagination works
- `/products` — Product grid renders, sort/filter controls work
- `/blog` — Blog post grid renders
- `/sign-in` — Sign-in form renders
- `/404` or any unknown path — Not Found page renders with Logo and back button

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: FSD migration complete — all layers verified"
```

---

## Appendix: Type-Only MUI Imports

Files may still have:
```typescript
import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';
import type { CardProps } from '@mui/material/Card';
```

These are TypeScript-only imports erased at compile time. They do NOT violate the FSD runtime import rules and may stay as-is. The ESLint boundaries plugin tracks module graph, not type imports.
