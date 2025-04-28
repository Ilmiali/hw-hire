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
import { PlusIcon } from '@heroicons/react/16/solid';
import { Badge } from '../components/badge';
import { CreateViewDialog } from '../database-components/createViewDialog';

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

  const createView = (name: string) => {
    console.log('createView with name:', name);
    // TODO: Implement view creation logic
  };

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
        <SidebarItem
          key={view.id}
          href={`/views/${view.id}`}
          current={location.pathname === `/views/${view.id}`}
        >
          <Avatar 
            variant="square"
            light={true}
            initials={getInitials(view.name)}
            className="bg-blue-500 text-white"
          />
          <SidebarLabel>{view.name}</SidebarLabel>
          <Badge className="ml-auto bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {view.totalNumTickets}
          </Badge>
        </SidebarItem>
      ))}
      <SidebarItem
        onClick={() => setIsCreateDialogOpen(true)}
        className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-800 dark:hover:text-zinc-300"
      >
        <PlusIcon />
        <SidebarLabel className="text-zinc-500 dark:text-zinc-400">Add new</SidebarLabel>
      </SidebarItem>
      <CreateViewDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={createView}
      />
    </SidebarSection>
  );
} 