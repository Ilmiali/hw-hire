import { UserCircleIcon, Cog6ToothIcon, BellIcon, UserGroupIcon, ChatBubbleLeftRightIcon, FunnelIcon, EyeIcon } from '@heroicons/react/20/solid';
import { AccountSettings } from './AccountSettings';
import { PreferencesSettings } from './PreferencesSettings';
import { NotificationsSettings } from './NotificationsSettings';
import { GroupsSettings } from './GroupsSettings';
import { ChannelsSettings } from './ChannelsSettings';
import { FiltersSettings } from './FiltersSettings';
import { ViewsSettings } from './ViewsSettings';
import { ReactNode, ComponentType } from 'react';

interface SettingsSection {
  key: string;
  label: string;
  icon: ReactNode;
  component: ComponentType<Record<string, never>>;
}

export const settingsSections: SettingsSection[] = [
  { 
    key: 'account', 
    label: 'Account', 
    icon: <UserCircleIcon className="w-5 h-5" />,
    component: AccountSettings
  },
  { 
    key: 'preferences', 
    label: 'Preferences', 
    icon: <Cog6ToothIcon className="w-5 h-5" />,
    component: PreferencesSettings
  },
  { 
    key: 'notifications', 
    label: 'Notifications', 
    icon: <BellIcon className="w-5 h-5" />,
    component: NotificationsSettings
  },
  { 
    key: 'groups', 
    label: 'Groups', 
    icon: <UserGroupIcon className="w-5 h-5" />,
    component: GroupsSettings
  },
  { 
    key: 'channels', 
    label: 'Channels', 
    icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
    component: ChannelsSettings
  },
  { 
    key: 'filters', 
    label: 'Filters', 
    icon: <FunnelIcon className="w-5 h-5" />,
    component: FiltersSettings
  },
  { 
    key: 'views', 
    label: 'Views', 
    icon: <EyeIcon className="w-5 h-5" />,
    component: ViewsSettings
  },
]; 