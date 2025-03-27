import { ComponentType } from 'react';
import { SVGProps } from 'react';

export type LayoutType = 'authenticated' | 'public';
export type SidebarSection = 'header' | 'body' | 'footer';

export interface RouteConfig {
  path: string;
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  component: ComponentType;
  layout: LayoutType;
  isAuthProtected: boolean;
  permissions?: string[];
  children?: RouteConfig[];
}

export interface RouteGroup {
  name: string;
  routes: RouteConfig[];
  section: SidebarSection;
  order?: number; // Optional order for sorting within the same section
} 