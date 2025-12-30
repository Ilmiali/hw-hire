import { memo } from 'react';
import { Avatar } from '../components/avatar';
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '../components/dropdown';
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '../components/navbar';
import {
  ArrowRightStartOnRectangleIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/16/solid';
import {
  InboxIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';

export const MainNavbar = memo(function MainNavbar() {
  return (
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
            <Avatar src="/profile-photo.jpg" variant="square" />
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
  );
}); 