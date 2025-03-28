import { SidebarLayout } from '../components/sidebar-layout'
import { MainSidebar } from '../sidebar/MainSidebar'
import { MainNavbar } from '../navbar/MainNavbar'
import { Outlet } from 'react-router-dom'

export function AuthenticatedLayout() {
  return (
    <SidebarLayout
      navbar={
        <MainNavbar />
      }
      sidebar={
        <MainSidebar />
      }
    >
        <Outlet />
    </SidebarLayout>
  );
}