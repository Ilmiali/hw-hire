import { useSelector } from 'react-redux';
import { selectCurrentOrganization } from '../../store/slices/organizationSlice';
import { RootState } from '../../store';

export function GroupsSettings() {
  const currentOrganization = useSelector(selectCurrentOrganization);
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Groups</h2>
      <p className="text-zinc-600 dark:text-zinc-300">Manage your groups and group settings here.</p>
      
      {currentOrganization && (
        <div className="mt-4">
          <p>Current Organization: {currentOrganization.name}</p>
          {user && <p>User: {user.email}</p>}
          {/* Add group management UI here */}
        </div>
      )}
    </div>
  );
} 