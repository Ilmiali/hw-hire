import { useState } from 'react';
import { Dialog, DialogTitle } from '../../components/dialog';
import { Sidebar, SidebarBody, SidebarSection, SidebarItem, SidebarLabel } from '../../components/sidebar';
import { UserCircleIcon, Cog6ToothIcon, BellIcon } from '@heroicons/react/20/solid';

const sections = [
  { key: 'account', label: 'Account', icon: <UserCircleIcon className="w-5 h-5" /> },
  { key: 'preferences', label: 'Preferences', icon: <Cog6ToothIcon className="w-5 h-5" /> },
  { key: 'notifications', label: 'Notifications', icon: <BellIcon className="w-5 h-5" /> },
];

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeSection, setActiveSection] = useState('account');

  return (
    <Dialog open={open} onClose={onClose} size="5xl" className="!p-0">
      <div className="relative flex flex-row min-h-[500px] max-h-[80vh] w-full max-w-5xl bg-white dark:bg-zinc-900 dark:text-white rounded-2xl overflow-hidden">
        {/* Sidebar */}
        <Sidebar className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-800 h-full">
          <SidebarBody className="p-0">
            <SidebarSection>
              {sections.map((section) => (
                <SidebarItem
                  key={section.key}
                  current={activeSection === section.key}
                  onClick={() => setActiveSection(section.key)}
                  className="mb-1"
                >
                  {section.icon}
                  <SidebarLabel>{section.label}</SidebarLabel>
                </SidebarItem>
              ))}
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
        {/* Main content */}
        <div className="flex-1 min-w-0 overflow-y-auto p-6 relative">
          <DialogTitle className="flex items-center gap-2 text-xl mb-4">
            {sections.find(s => s.key === activeSection)?.icon}
            {sections.find(s => s.key === activeSection)?.label}
          </DialogTitle>
          <div>
            {activeSection === 'account' && <AccountSettings />}
            {activeSection === 'preferences' && <PreferencesSettings />}
            {activeSection === 'notifications' && <NotificationsSettings />}
          </div>  
        </div>
      </div>
    </Dialog>
  );
}

function AccountSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Account Settings</h2>
      <p className="text-zinc-600 dark:text-zinc-300">Manage your account information here.</p>
    </div>
  );
}

function PreferencesSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Preferences</h2>
      <p className="text-zinc-600 dark:text-zinc-300">Set your application preferences here.</p>
    </div>
  );
}

function NotificationsSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Notifications</h2>
      <p className="text-zinc-600 dark:text-zinc-300">Configure your notification settings here.</p>
    </div>
  );
} 