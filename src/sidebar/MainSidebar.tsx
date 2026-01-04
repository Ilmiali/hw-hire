import { Sidebar, SidebarHeader, SidebarSection, SidebarSpacer, SidebarFooter, SidebarBody, SidebarItem, SidebarLabel, SidebarHeading } from '../components/sidebar';
import { getSidebarRoutes } from '../config/routes';
import { useLocation } from 'react-router-dom';
import { Dropdown, DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu, DropdownButton  } from '../components/dropdown';
import { Avatar } from '../components/avatar';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { getTeamDropdownConfig } from '../config/dropdowns';
import { ViewsSidebarSection } from './ViewsSidebarSection';
import { RecruitingSidebarSection } from './RecruitingSidebarSection';
import { useState } from 'react';
import { Cog8ToothIcon } from '@heroicons/react/16/solid';
import { SettingsModal } from '../screens/Settings/SettingsModal';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export function MainSidebar({ collapsed, setCollapsed }: { collapsed?: boolean; setCollapsed?: (v: boolean) => void }) {
  const location = useLocation();
  const routesBySection = getSidebarRoutes();
  const dropdownConfig = getTeamDropdownConfig();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { userData } = useSelector((state: RootState) => state.auth);
  const { currentOrganization } = useSelector((state: RootState) => state.organization);

  const renderDropdownMenu = () => (
    <Dropdown>
      <DropdownButton as={SidebarItem} className="lg:mb-2.5">
        <Avatar 
          src={dropdownConfig.trigger.avatar.src} 
          initials={dropdownConfig.trigger.avatar.initials}
          className={dropdownConfig.trigger.avatar.className}
        />
        <SidebarLabel>{dropdownConfig.trigger.label}</SidebarLabel>
        <ChevronDownIcon />
      </DropdownButton>
      <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
        {userData && (
          <>
            <div className="px-3.5 py-3 border-b border-zinc-950/5 dark:border-white/10 mb-1 col-span-full">
              <div className="flex items-center gap-3">
                <Avatar 
                  initials={`${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase()} 
                  className="size-9 bg-blue-500 text-white"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-950 dark:text-white truncate">
                    {userData.firstName} {userData.lastName}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {userData.email}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        {dropdownConfig.items.map((item, index) => {
          if (item.isDivider) {
            return <DropdownDivider key={`divider-${index}`} />;
          }

          return (
            <DropdownItem
              key={item.label}
              href={item.href}
              onClick={item.onClick}
            >
              {item.icon && <item.icon />}
              {item.avatar && (
                <Avatar
                  slot="icon"
                  src={item.avatar.src}
                  initials={item.avatar.initials}
                  className={item.avatar.className}
                />
              )}
              <DropdownLabel>{item.label}</DropdownLabel>
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );

  const renderRouteGroup = (group: typeof routesBySection.body[0]) => (
    <SidebarSection key={group.name}>
      {group.name && <SidebarHeading>{group.name}</SidebarHeading>}
      {group.routes.map((route) => {
        const resolvedPath = route.path.replace(':orgId', currentOrganization?.id || '');
        return (
          <SidebarItem
            key={route.path}
            href={resolvedPath}
            current={location.pathname === resolvedPath}
          >
            <route.icon />
            <SidebarLabel>{route.name}</SidebarLabel>
          </SidebarItem>
        );
      })}
    </SidebarSection>
  );

  return (
    <>
      <Sidebar collapsed={collapsed || false} setCollapsed={setCollapsed || (() => {})}>
        <SidebarHeader>
          {renderDropdownMenu()}
          {routesBySection.header?.length > 0 && (
            routesBySection.header.map(renderRouteGroup)
          )}
        </SidebarHeader>
        <SidebarBody>
          {routesBySection.body?.map(renderRouteGroup)}
          <RecruitingSidebarSection />
          <ViewsSidebarSection />
        </SidebarBody>
        <SidebarSpacer />
        <SidebarFooter>
          {routesBySection.footer?.map(renderRouteGroup)}
          <SidebarSection>
            <SidebarItem onClick={() => setSettingsOpen(true)}>
              <Cog8ToothIcon className="w-5 h-5" />
              <SidebarLabel>Settings</SidebarLabel>
            </SidebarItem>
          </SidebarSection>
          <div className="mt-2 flex max-lg:hidden">
              <SidebarItem onClick={() => setCollapsed?.(!collapsed)}>
                  {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}  
                  <SidebarLabel>Collapse</SidebarLabel>
              </SidebarItem>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}