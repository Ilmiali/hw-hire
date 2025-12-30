import {
  Cog8ToothIcon,
  PlusIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/16/solid';
import { DropdownConfig } from '../types/dropdown';
import { logoutUser } from '../store/slices/authSlice';
import { store } from '../store';
import { selectCurrentOrganization, selectOrganizations, setCurrentOrganization } from '../store/slices/organizationSlice';
import { Organization } from '../types/organization';

const handleLogout = () => {
  store.dispatch(logoutUser());
};

const getOrganizationDropdownItems = (organizations: Organization[], currentOrg: Organization | null) => {
  const items = organizations.map(org => ({
    label: org.name,
    href: `/orgs/${org.id}/dashboard`,
    avatar: {
      initials: org.name.split(' ').map(word => word[0]).join('').toUpperCase(),
      className: "bg-blue-500 text-white",
    },
    onClick: () => store.dispatch(setCurrentOrganization(org)),
  }));

  return [
    ...items,
    {
      label: "New organization...",
      href: "/orgs/new",
      icon: PlusIcon,
    },
    {
      isDivider: true,
    },
    {
      label: "Settings",
      href: currentOrg ? `/orgs/${currentOrg.id}/settings` : "/orgs/settings",
      icon: Cog8ToothIcon,
    },
    {
      label: "Sign out",
      icon: ArrowRightStartOnRectangleIcon,
      onClick: handleLogout,
    },
  ];
};

export const getTeamDropdownConfig = (): DropdownConfig => {
  const state = store.getState();
  const organizations = selectOrganizations(state);
  const currentOrg = selectCurrentOrganization(state);

  return {
    trigger: {
      avatar: {
        initials: currentOrg ? currentOrg.name.split(' ').map(word => word[0]).join('').toUpperCase() : "NA",
        className: "bg-blue-500 text-white",
      },
      label: currentOrg?.name || "No organization selected",
    },
    items: getOrganizationDropdownItems(organizations, currentOrg),
  };
}; 