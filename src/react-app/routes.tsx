import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import LandingPage from './pages/LandingPage';
import UIComponentsPage from './pages/UIComponentsPage';
import ContactPage from './pages/ContactPage';
import DashboardPage from './pages/DashboardPage';
import WellnessPage from './pages/WellnessPage';
import MainLayout from './layouts/MainLayout';

// Lazy-loaded pages
const TagsShowcasePage = lazy(() => import('./pages/TagsShowcasePage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/app',
        element: <App />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/wellness',
        element: <WellnessPage />,
      },
      {
        path: '/ui-components',
        element: <UIComponentsPage />,
      },
      {
        path: '/components/tags',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <TagsShowcasePage />
          </Suspense>
        ),
      },
      {
        path: '/support',
        element: <ContactPage />,
      },
      {
        path: '*',
        element: <div>Page not found</div>,
      },
    ],
  },
]);

export default router; 