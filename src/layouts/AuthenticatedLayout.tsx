import { Avatar } from '../components/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '../components/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '../components/navbar'
import { SidebarLayout } from '../components/sidebar-layout'
import {
  ArrowRightStartOnRectangleIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/16/solid'
import {
  InboxIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid'
import { MainSidebar } from '../sidebar/MainSidebar'

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {

  return (
    <SidebarLayout
      navbar={
        <Navbar className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href="/search" aria-label="Search" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              <MagnifyingGlassIcon />
            </NavbarItem>
            <NavbarItem href="/inbox" aria-label="Inbox" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              <InboxIcon />
            </NavbarItem>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar src="/profile-photo.jpg" square />
              </DropdownButton>
              <DropdownMenu className="min-w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" anchor="bottom end">
                <DropdownItem href="/my-profile" className="text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/50">
                  <UserIcon />
                  <DropdownLabel>My profile</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/settings" className="text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/50">
                  <Cog8ToothIcon />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider className="border-gray-200 dark:border-gray-700" />
                <DropdownItem href="/privacy-policy" className="text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/50">
                  <ShieldCheckIcon />
                  <DropdownLabel>Privacy policy</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/share-feedback" className="text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/50">
                  <LightBulbIcon />
                  <DropdownLabel>Share feedback</DropdownLabel>
                </DropdownItem>
                <DropdownDivider className="border-gray-200 dark:border-gray-700" />
                <DropdownItem href="/logout" className="text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/50">
                  <ArrowRightStartOnRectangleIcon />
                  <DropdownLabel>Sign out</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <MainSidebar />
      }
    >
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {children}
      </div>
    </SidebarLayout>
  );
}