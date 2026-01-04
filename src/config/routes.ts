import {
  HomeIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  SparklesIcon,
  ClipboardDocumentListIcon as ApplicationIcon,
  EyeIcon,
  QueueListIcon,
  BriefcaseIcon,
  DocumentIcon,
  UserGroupIcon,
} from '@heroicons/react/16/solid';
import Dashboard from '../screens/Dashboard';
import Profile from '../screens/Profile';
import Login from '../screens/Login';
import FormBuilder from '../screens/FormBuilder/FormBuilder';
import Applications from '../screens/Applications/Applications';
import FormPreview from '../screens/FormBuilder/FormPreview';
import PipelineListPage from '../screens/Pipeline/PipelineListPage';
import PipelineEditor from '../screens/Pipeline/PipelineEditor';
import JobPipelineBoard from '../screens/Pipeline/JobPipelineBoard';
import JobsListPage from '../screens/Jobs/JobsListPage';
import JobDetailPage from '../screens/Jobs/JobDetailPage';
import FormsList from '../screens/Forms/FormsList';
import { RouteConfig, RouteGroup } from '../types/routes';
import PublicApplyPage from '../screens/Public/PublicApplyPage';
import RecruitingJobDetail from '../screens/Recruiting/RecruitingJobDetail';
import RecruitingApplicationDetail from '../screens/Recruiting/RecruitingApplicationDetail';


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
  {
    path: '/apply/:publicPostingId',
    name: 'Apply',
    icon: DocumentIcon,
    component: PublicApplyPage,
    layout: 'public',
    isAuthProtected: false,
  },
];

// Additional routes that shouldn't appear in the sidebar
export const additionalRoutes: RouteConfig[] = [
  {
    path: '/orgs/:orgId/recruiting/:jobId',
    name: 'Recruiting Job Details',
    icon: BriefcaseIcon,
    component: RecruitingJobDetail,
    layout: 'authenticated',
    isAuthProtected: true,
  },
  {
    path: '/orgs/:orgId/recruiting/:jobId/applications/:applicationId',
    name: 'Job Application Details',
    icon: UserGroupIcon,
    component: RecruitingJobDetail,
    layout: 'authenticated',
    isAuthProtected: true,
  },
  {
    path: '/orgs/:orgId/recruiting/applications/:applicationId',
    name: 'Applicant Details',
    icon: UserGroupIcon,
    component: RecruitingApplicationDetail,
    layout: 'authenticated',
    isAuthProtected: true,
  },
  {
    path: '/orgs/:orgId/applications/:id',
    name: 'Application Details',
    icon: ApplicationIcon,
    component: Applications,
    layout: 'authenticated',
    isAuthProtected: true,
  },
  {
    path: '/orgs/:orgId/views/:id',
    name: 'View Details',
    icon: ApplicationIcon,
    component: Applications,
    layout: 'authenticated',
    isAuthProtected: true,
  },
  {
    path: '/orgs/:orgId/forms/:formId/preview',
    name: 'Form Preview',
    icon: EyeIcon,
    component: FormPreview,
    layout: 'authenticated',
    isAuthProtected: true,
  },
  {
    path: '/orgs/:orgId/pipelines/:id',
    name: 'Edit Pipeline',
    icon: QueueListIcon,
    component: PipelineEditor,
    layout: 'authenticated',
    isAuthProtected: true,
  },
  {
    path: '/orgs/:orgId/pipelines/:id/preview',
    name: 'Pipeline Preview',
    icon: EyeIcon, // Or generic icon
    component: JobPipelineBoard,
    layout: 'authenticated',
    isAuthProtected: true,
  },

  {
    path: '/orgs/:orgId/jobs/:jobId',
    name: 'Job Details',
    icon: BriefcaseIcon,
    component: JobDetailPage,
    layout: 'authenticated',
    isAuthProtected: true,
  },
  {
    path: '/orgs/:orgId/forms/:formId',
    name: 'Form Builder',
    icon: SparklesIcon,
    component: FormBuilder,
    layout: 'authenticated',
    isAuthProtected: true,
  },
  {
    path: '/orgs/:orgId/dashboard',
    name: 'Organization Dashboard',
    icon: HomeIcon,
    component: Dashboard,
    layout: 'authenticated',
    isAuthProtected: true,
  },
  {
    path: '/orgs/:orgId/applications',
    name: 'Applications',
    icon: ApplicationIcon,
    component: Applications,
    layout: 'authenticated',
    isAuthProtected: true,
  },
  {
    path: '/orgs/:orgId/profile',
    name: 'Profile',
    icon: UserIcon,
    component: Profile,
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
        path: '/orgs/:orgId/dashboard',
        name: 'Dashboard',
        icon: HomeIcon,
        component: Dashboard,
        layout: 'authenticated',
        isAuthProtected: true,
      },
    ],
  },
  // Build section
  {
    name: 'Build',
    section: 'body',
    order: 1,
    routes: [
      {
        path: '/orgs/:orgId/forms',
        name: 'Forms',
        icon: DocumentIcon,
        component: FormsList,
        layout: 'authenticated',
        isAuthProtected: true,
      },
      {
        path: '/orgs/:orgId/pipelines',
        name: 'Pipelines',
        icon: QueueListIcon,
        component: PipelineListPage,
        layout: 'authenticated',
        isAuthProtected: true,
      },
      {
        path: '/orgs/:orgId/jobs',
        name: 'Jobs',
        icon: BriefcaseIcon,
        component: JobsListPage,
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