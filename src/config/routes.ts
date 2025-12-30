import {
  HomeIcon,
  UserIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  ArrowRightStartOnRectangleIcon,
  SparklesIcon,
  ClipboardDocumentListIcon as ApplicationIcon,
  EyeIcon,
} from '@heroicons/react/16/solid';
import Dashboard from '../screens/Dashboard';
import Profile from '../screens/Profile';
import Login from '../screens/Login';
import FormBuilder from '../screens/FormBuilder/FormBuilder';
import Applications from '../screens/Applications/Applications';
import FormPreview from '../screens/FormBuilder/FormPreview';
import { RouteConfig, RouteGroup } from '../types/routes';

// Public routes (no authentication required)
export const publicRoutes: RouteConfig[] = [
  {
    path: '/login',
    name: 'Login',
    icon: ArrowRightStartOnRectangleIcon,
    component: Login,
    layout: 'public',
    isAuthProtected: false,
  },
];

// Additional routes that shouldn't appear in the sidebar
export const additionalRoutes: RouteConfig[] = [
  {
    path: '/applications/:id',
    name: 'Application Details',
    icon: ApplicationIcon,
    component: Applications,
    layout: 'authenticated',
    isAuthProtected: true,
  },
  {
    path: '/views/:id',
    name: 'View Details',
    icon: ApplicationIcon,
    component: Applications,
    layout: 'authenticated',
    isAuthProtected: true,
  },
  {
    path: '/form-builder/preview',
    name: 'Form Preview',
    icon: EyeIcon,
    component: FormPreview,
    layout: 'authenticated',
    isAuthProtected: true,
  },
];
// Main navigation routes (authenticated)
export const mainRoutes: RouteGroup[] = [
  // Header section
  {
    name: '',
    section: 'header',
    order: 1,
    routes: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        icon: HomeIcon,
        component: Dashboard,
        layout: 'authenticated',
        isAuthProtected: true,
      },
      {
        path: '/form-builder',
        name: 'Form Builder',
        icon: SparklesIcon,
        component: FormBuilder,
        layout: 'authenticated',
        isAuthProtected: true,
      },
      {
        path: '/applications',
        name: 'Applications',
        icon: ApplicationIcon,
        component: Applications,
        layout: 'authenticated',
        isAuthProtected: true,
      },
      {
        path: '/profile',
        name: 'Profile',
        icon: UserIcon,
        component: Profile,
        layout: 'authenticated',
        isAuthProtected: true,
      },
    ],
  },
  // Body section
  {
    name: 'Settings',
    section: 'body',
    order: 2,
    routes: [
      {
        path: '/privacy-policy',
        name: 'Privacy Policy',
        icon: ShieldCheckIcon,
        component: Dashboard, // Replace with actual Privacy Policy component
        layout: 'authenticated',
        isAuthProtected: true,
      },
      {
        path: '/share-feedback',
        name: 'Share Feedback',
        icon: LightBulbIcon,
        component: Dashboard, // Replace with actual Feedback component
        layout: 'authenticated',
        isAuthProtected: true,
      },
    ],
  },
  // Footer section
  {
    name: 'Support',
    section: 'footer',
    order: 1,
    routes: [
      {
        path: '/changelog',
        name: 'Changelog',
        icon: SparklesIcon,
        component: Dashboard, // Replace with actual component
        layout: 'authenticated',
        isAuthProtected: true,
      },
    ],
  },
];

// Helper function to get all routes (including nested ones)
export function getAllRoutes(): RouteConfig[] {
  const routes: RouteConfig[] = [...publicRoutes, ...additionalRoutes];
  
  mainRoutes.forEach(group => {
    routes.push(...group.routes);
  });
  
  return routes;
}

// Helper function to get routes for the sidebar, grouped by section
export function getSidebarRoutes(): Record<RouteGroup['section'], RouteGroup[]> {
  const routesBySection = mainRoutes.reduce((acc, group) => {
    if (!acc[group.section]) {
      acc[group.section] = [];
    }
    acc[group.section].push(group);
    return acc;
  }, {} as Record<RouteGroup['section'], RouteGroup[]>);

  // Sort groups within each section by order
  Object.keys(routesBySection).forEach(section => {
    routesBySection[section as RouteGroup['section']].sort((a, b) => {
      return (a.order || 0) - (b.order || 0);
    });
  });

  return routesBySection;
}

// Helper function to get public routes
export function getPublicRoutes(): RouteConfig[] {
  return publicRoutes;
}

// Helper function to get authenticated routes
export function getAuthenticatedRoutes(): RouteConfig[] {
  return getAllRoutes().filter(route => route.isAuthProtected);
} 