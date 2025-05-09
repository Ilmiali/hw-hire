import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export function AccountSettings() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Account Settings</h2>
      <p className="text-zinc-600 dark:text-zinc-300">Manage your account information here.</p>
      
      {user && (
        <div className="mt-4">
          <p>Email: {user.email}</p>
          {/* Add more user information and settings controls here */}
        </div>
      )}
    </div>
  );
} 