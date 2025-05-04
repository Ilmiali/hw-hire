import { useState } from 'react';
import { Dialog, DialogTitle } from '../../components/dialog';
import { Sidebar, SidebarBody, SidebarSection, SidebarItem, SidebarLabel } from '../../components/sidebar';
import { settingsSections } from './routes.tsx';

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeSection, setActiveSection] = useState('account');

  return (
    <Dialog open={open} onClose={onClose} size="5xl" className="!p-0">
      <div className="relative flex flex-row min-h-[500px] max-h-[80vh] w-full max-w-5xl bg-white dark:bg-zinc-900 dark:text-white rounded-2xl overflow-hidden">
        {/* Sidebar */}
        <Sidebar className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-800 h-full">
          <SidebarBody className="p-0">
            <SidebarSection>
              {settingsSections.map((section) => (
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
            {settingsSections.find(s => s.key === activeSection)?.icon}
            {settingsSections.find(s => s.key === activeSection)?.label}
          </DialogTitle>
          <div>
            {settingsSections.find(s => s.key === activeSection)?.component()}
          </div>  
        </div>
      </div>
    </Dialog>
  );
} 