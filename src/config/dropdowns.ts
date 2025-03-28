import {
  Cog8ToothIcon,
  PlusIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/16/solid';
import { DropdownConfig } from '../types/dropdown';
import { logoutUser } from '../store/slices/authSlice';
import { store } from '../store';

const handleLogout = () => {
  store.dispatch(logoutUser());
};

export const teamDropdownConfig: DropdownConfig = {
  trigger: {
    avatar: {
      src: "https://catalyst-demo.tailwindui.com/teams/catalyst.svg",
    },
    label: "Hoiwa HR",
  },
  items: [
    {
      label: "Hoiwa HR",
      href: "/teams/1",
      avatar: {
        src: "/tailwind-logo.svg",
      },
    },
    {
      label: "Hoiwa Payroll",
      href: "/teams/2",
      avatar: {
        initials: "HP",
        className: "bg-purple-500 text-white",
      },
    },
    {
      label: "New team...",
      href: "/teams/create",
      icon: PlusIcon,
    },
    {
      isDivider: true,
    },
    {
      label: "Settings",
      href: "/teams/1/settings",
      icon: Cog8ToothIcon,
    },
    {
      label: "Sign out",
      icon: ArrowRightStartOnRectangleIcon,
      onClick: handleLogout,
    },
  ],
}; 