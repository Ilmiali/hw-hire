import { SidebarLayout } from '../components/sidebar-layout'
import { MainSidebar } from '../sidebar/MainSidebar'
import { MainNavbar } from '../navbar/MainNavbar'
import { ReactNode, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { setCurrentOrganization } from '../store/slices/organizationSlice'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { OrganizationSelectModal } from '../components/OrganizationSelectModal'

// Configure NProgress
NProgress.configure({ showSpinner: false })

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const location = useLocation()
  const { orgId } = useParams<{ orgId: string }>()
  const dispatch = useDispatch()
  const { currentOrganization, organizations } = useSelector((state: RootState) => state.organization)
  const [, setIsLoading] = useState(false)
  const isFormPage = location.pathname.includes('/forms/') && location.pathname.split('/').length > 4
  const [collapsed, setCollapsed] = useState(() => isFormPage)

  // Sync current organization with URL parameter
  useEffect(() => {
    if (orgId && (!currentOrganization || currentOrganization.id !== orgId)) {
      const org = organizations.find(o => o.id === orgId)
      if (org) {
        dispatch(setCurrentOrganization(org))
      }
    }
  }, [orgId, currentOrganization, organizations, dispatch])

  // Default to collapsed for Form Builder and Preview
  useEffect(() => {
    if (isFormPage) {
      setCollapsed(true)
    } else {
      setCollapsed(false)
    }
  }, [location.pathname, isFormPage])

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
    <>
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
      <OrganizationSelectModal />
    </>
  );
}