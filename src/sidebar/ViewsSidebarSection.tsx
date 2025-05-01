import { SidebarSection, SidebarItem, SidebarLabel, SidebarHeading } from '../components/sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchOrganizationViews } from '../store/slices/viewsSlice';
import { selectCurrentOrganization } from '../store/slices/organizationSlice';
import { selectViews, selectViewsLoading } from '../store/slices/viewsSlice';
import { useLocation } from 'react-router-dom';
import { AppDispatch } from '../store';
import { RootState } from '../store';
import { Avatar } from '../components/avatar';
import { PlusIcon, EllipsisHorizontalIcon } from '@heroicons/react/16/solid';
import { Badge } from '../components/badge';
import { CreateViewDialog } from '../database-components/createViewDialog';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu, DropdownLabel } from '../components/dropdown';
import { PencilIcon, TrashIcon } from '@heroicons/react/16/solid';

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function ViewsSidebarSection() {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const currentOrganization = useSelector(selectCurrentOrganization);
  const views = useSelector(selectViews);
  const loading = useSelector(selectViewsLoading);
  const userId = useSelector((state: RootState) => state.auth.user?.uid);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingViewId, setEditingViewId] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganization && userId) {
      dispatch(fetchOrganizationViews({ 
        organizationId: currentOrganization.id,
        userId
      }));
    }
  }, [dispatch, currentOrganization, userId]);

  if (!currentOrganization || !userId || loading) {
    return null;
  }

  return (
    <SidebarSection>
      <SidebarHeading>Views</SidebarHeading>
      {views.map((view) => (
        <div key={view.id} className="group relative">
          <SidebarItem
            href={`/views/${view.id}`}
            current={location.pathname === `/views/${view.id}`}
          >
            {view.layout?.iconType === 'emoji' ? (
              <div 
                className="h-6 w-6 flex items-center justify-center rounded-lg text-lg"
                style={{ 
                  background: view.layout?.cover || '#64B5F6',
                  backgroundImage: view.layout?.coverType === 'gradient' ? `linear-gradient(${view.layout?.cover})` : undefined
                }}
              >
                {view.layout?.icon || getInitials(view.name)}
              </div>
            ) : (
              <Avatar 
                variant="square"
                light={true}
                initials={getInitials(view.name)}
                className="bg-blue-500 text-white"
              />
            )}
            <SidebarLabel>{view.name}</SidebarLabel>
            <Badge className="ml-auto bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 opacity-100 group-hover:opacity-0 transition-opacity">
              {view.totalNumTickets}
            </Badge>
          </SidebarItem>
          <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Dropdown>
              <DropdownButton style={{marginRight: '0.5rem'}} as="button" className="!p-0 !bg-transparent !border-0 !shadow-none hover:!bg-gray-100 hover:dark:!bg-gray-700 hover:!p-1 hover:!rounded-md transition-all">
                <EllipsisHorizontalIcon className="h-3 w-3 text-gray-400 dark:text-gray-500" />
              </DropdownButton>
              <DropdownMenu className="min-w-48" anchor="bottom end">
                <DropdownItem onClick={() => {
                  setEditingViewId(view.id);
                  setIsCreateDialogOpen(true);
                }}>
                  <PencilIcon />
                  <DropdownLabel>Edit view</DropdownLabel>
                </DropdownItem>
                <DropdownItem>
                  <TrashIcon />
                  <DropdownLabel>Delete view</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      ))}
      <SidebarItem
        onClick={() => {
          setEditingViewId(null);
          setIsCreateDialogOpen(true);
        }}
        className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-800 dark:hover:text-zinc-300"
      >
        <PlusIcon />
        <SidebarLabel className="text-zinc-500 dark:text-zinc-400">Add new</SidebarLabel>
      </SidebarItem>
      <CreateViewDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingViewId(null);
        }}
        viewId={editingViewId || undefined}
      />
    </SidebarSection>
  );
} 