
import React, { useEffect } from 'react';
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './features/dashboard/components/DashboardPage';
import { CanvasPage } from './features/canvas/components/CanvasPage';
import { ReviewLobby } from './features/review/components/ReviewLobby';
import { ReviewSession } from './features/review/components/ReviewSession';
import { FeynmanGuardian } from './features/review/components/FeynmanGuardian';
import { useMindoStore } from './store/useMindoStore';

// Simple Settings Placeholder
const SettingsPage = () => (
  <div className="p-10 flex flex-col items-center justify-center h-full text-center">
    <div className="p-4 bg-white/5 dark:bg-white/50 bg-slate-200 rounded-full border border-white/10 mb-4">
      <span className="text-4xl">⚙️</span>
    </div>
    <h1 className="text-3xl font-bold dark:text-white text-slate-800 mb-2">Settings</h1>
    <p className="text-slate-500">Configuration options coming soon.</p>
  </div>
);

const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'canvas', element: <CanvasPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'review', element: <ReviewLobby /> },
    ],
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
    <>
      <RouterProvider router={router} />
      <FeynmanGuardian /> 
    </>
  );
}
