import { SidebarLayout } from '../components/sidebar-layout'
import { MainSidebar } from '../sidebar/MainSidebar'
import { MainNavbar } from '../navbar/MainNavbar'
import { ReactNode, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Configure NProgress
NProgress.configure({ showSpinner: false })

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const location = useLocation()
  const [, setIsLoading] = useState(false)
  const [collapsed, setCollapsed] = useState(() => location.pathname.startsWith('/form-builder'))

  // Default to collapsed for Form Builder
  useEffect(() => {
    if (location.pathname.startsWith('/form-builder')) {
      setCollapsed(true)
    } else {
      setCollapsed(false)
    }
  }, [location.pathname])

  useEffect(() => {
    setIsLoading(true)
    NProgress.start()
    
    const timer = setTimeout(() => {
      setIsLoading(false)
      NProgress.done()
    }, 500) // Small delay to ensure smooth animation

    return () => {
      clearTimeout(timer)
      NProgress.done()
    }
  }, [location])

  return (
    <SidebarLayout
      collapsed={collapsed}
      navbar={
        <MainNavbar />
      }
      sidebar={({ collapsed }) => (
        <MainSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}
    >
      {children}
    </SidebarLayout>
  );
}