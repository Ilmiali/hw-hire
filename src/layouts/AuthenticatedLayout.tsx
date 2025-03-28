import { SidebarLayout } from '../components/sidebar-layout'
import { MainSidebar } from '../sidebar/MainSidebar'
import { MainNavbar } from '../navbar/MainNavbar'
import { ReactNode } from 'react'

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <SidebarLayout
      navbar={
        <MainNavbar />
      }
      sidebar={
        <MainSidebar />
      }
    >
      {children}
    </SidebarLayout>
  );
}