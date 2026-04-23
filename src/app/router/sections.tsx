import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { Outlet, Navigate } from 'react-router-dom';

import { AuthGuard, GuestGuard } from '@shared/router/components';
import { Box, LinearProgress, linearProgressClasses } from '@shared/ui';

import { AuthLayout } from '@widgets/auth-layout';
import { DashboardLayout } from '@widgets/dashboard-layout';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('@pages/dashboard'));
export const BlogPage = lazy(() => import('@pages/blog'));
export const UserPage = lazy(() => import('@pages/user'));
export const SignInPage = lazy(() => import('@pages/sign-in'));
export const SignUpPage = lazy(() => import('@pages/sign-up'));
export const ForgotPasswordPage = lazy(() => import('@pages/forgot-password'));
export const ProductsPage = lazy(() => import('@pages/products'));
export const ClientsPage = lazy(() => import('@pages/clients'));
export const TransactionsPage = lazy(() => import('@pages/transactions'));
export const Page404 = lazy(() => import('@pages/not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
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
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'clients', element: <ClientsPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'user', element: <UserPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'blog', element: <BlogPage /> },
    ],
  },
  {
    element: (
      <GuestGuard>
        <AuthLayout>
          <Outlet />
        </AuthLayout>
      </GuestGuard>
    ),
    children: [
      { path: 'sign-in', element: <SignInPage /> },
      { path: 'sign-up', element: <SignUpPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
