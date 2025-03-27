import { Sidebar, SidebarHeader, SidebarSection, SidebarSpacer, SidebarFooter, SidebarBody, SidebarItem, SidebarLabel, SidebarHeading } from '../components/sidebar';
import { getSidebarRoutes } from '../config/routes';
import { useLocation } from 'react-router-dom';
import { Dropdown, DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu, DropdownButton  } from '../components/dropdown';
import { Avatar } from '../components/avatar';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { teamDropdownConfig } from '../config/dropdowns';

export function MainSidebar() {
  const location = useLocation();
  const routesBySection = getSidebarRoutes();

  const renderDropdownMenu = () => (
    <Dropdown>
      <DropdownButton as={SidebarItem} className="lg:mb-2.5">
        <Avatar src={teamDropdownConfig.trigger.avatar.src} />
        <SidebarLabel>{teamDropdownConfig.trigger.label}</SidebarLabel>
        <ChevronDownIcon />
      </DropdownButton>
      <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
        {teamDropdownConfig.items.map((item, index) => {
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
    <SidebarSection className="max-lg:hidden">
      <SidebarHeading>{group.name}</SidebarHeading>
      {group.routes.map((route) => {
        const isActive = location.pathname === route.path;
        return (
          <SidebarItem 
            href={route.path}
            current={isActive}
          >
            <route.icon />
            <SidebarLabel>{route.name}</SidebarLabel>
          </SidebarItem>
        );
      })}
    </SidebarSection>
  );

  return (
    <Sidebar>
      {/* Header Section */}
      <SidebarHeader>
        {renderDropdownMenu()}
        {routesBySection.header?.length > 0 && (
          routesBySection.header.map(renderRouteGroup)
        )}
      </SidebarHeader>

      {/* Body Section */}
      <SidebarBody>
        {routesBySection.body?.map(renderRouteGroup)}
      </SidebarBody>
      <SidebarSpacer />
      {/* Footer Section */}
      {routesBySection.footer?.length > 0 && (
        <SidebarFooter>
          {routesBySection.footer.map(renderRouteGroup)}
        </SidebarFooter>
      )}
    </Sidebar>
  );
}