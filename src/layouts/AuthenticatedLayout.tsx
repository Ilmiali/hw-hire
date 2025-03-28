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
  const [isLoading, setIsLoading] = useState(false)

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