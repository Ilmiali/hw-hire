import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export function AccountSettings() {
  const { user, userData } = useSelector((state: RootState) => state.auth);

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-2">Account Settings</h2>
      <p className="text-zinc-600 dark:text-zinc-300 mb-6">Manage your account information here.</p>
      
      {userData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">First Name</label>
              <p className="mt-1 text-zinc-950 dark:text-white font-medium">{userData.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Last Name</label>
              <p className="mt-1 text-zinc-950 dark:text-white font-medium">{userData.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
              <p className="mt-1 text-zinc-950 dark:text-white font-medium">{userData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone Number</label>
              <p className="mt-1 text-zinc-950 dark:text-white font-medium">{userData.phoneNumber || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</label>
              <p className="mt-1 text-zinc-950 dark:text-white font-medium capitalize">{userData.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Account ID</label>
              <p className="mt-1 text-zinc-950 dark:text-white font-mono text-sm">{userData.accountId}</p>
            </div>
          </div>
        </div>
      ) : user ? (
        <div className="mt-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-zinc-600 dark:text-zinc-400">Loading profile details...</p>
          <p className="text-sm mt-1">Logged in as: {user.email}</p>
        </div>
      ) : (
        <p className="mt-4 text-red-600 dark:text-red-400">Please sign in to view your account settings.</p>
      )}
    </div>
  );
} 