
import React, { useEffect } from 'react';
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './features/dashboard/components/DashboardPage';
import { CanvasPage } from './features/canvas/components/CanvasPage';
import { ReviewLobby } from './features/review/components/ReviewLobby';
import { ReviewSession } from './features/review/components/ReviewSession';
import { FeynmanGuardian } from './features/review/components/FeynmanGuardian';
import { useMindoStore } from './store/useMindoStore';
import { AuthPage } from './features/auth/components/AuthPage';

import { SettingsPage } from './features/settings/components/SettingsPage';

const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'canvas', element: <CanvasPage /> },
      { path: 'canvas/node/:nodeId', element: <CanvasPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'review', element: <ReviewLobby /> },
    ],
  },
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    path: '/review/session',
    element: <ReviewSession />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

import { AuthProvider } from './features/auth/AuthContext';

export default function App() {
  const { theme } = useMindoStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <FeynmanGuardian />
    </AuthProvider>
  );
}
