import { ComponentType, SVGProps } from 'react';

export interface DropdownItemConfig {
  label?: string;
  href?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  avatar?: {
    src?: string;
    initials?: string;
    className?: string;
  };
  onClick?: () => void;
  isDivider?: boolean;
}

export interface DropdownConfig {
  trigger: {
    avatar: {
      src?: string;
      initials?: string;
      className?: string;
    };
    label: string;
  };
  items: DropdownItemConfig[];
} 