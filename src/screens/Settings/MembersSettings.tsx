import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useParams } from 'react-router-dom';
import { getDatabaseService } from '../../services/databaseService';
import { MembersTable, Member } from '../../database-components/MembersTable';
import { Heading } from '../../components/heading';

interface OrgMember {
  id: string; // uid
  role: string;
  createdAt: any;
  shares: any; 
}

interface UserProfile {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  avatarUrl?: string;
}

export function MembersSettings() {
  const { orgId } = useParams<{ orgId: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const moduleId = 'hire'; 

  useEffect(() => {
    async function fetchMembersData() {
      if (!orgId) return;
      setLoading(true);

      const db = getDatabaseService();
      try {
        const membersPath = `orgs/${orgId}/modules/${moduleId}/members`;
        const membersDocs = await db.getDocuments<any>(membersPath);

        // 2. Populate member info from users/{uid}
        const populatedMembers = await Promise.all(
          membersDocs.map(async (mDoc) => {
            const mData = mDoc.data as OrgMember || {};
            const userDoc = await db.getDocument<any>('users', mDoc.id);
            const userData = userDoc?.data as UserProfile || {};
            
            return {
              id: mDoc.id,
              name: userData.fullName || userData.name || 'Unknown User',
              email: userData.email || '',
              role: mData.role || 'Member',
              avatarUrl: userData.avatarUrl,
            } as Member;
          })
        );

        console.log('Final populated members:', populatedMembers);
        setMembers(populatedMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMembersData();
  }, [orgId]);

  const handleMembersChange = (updatedMembers: Member[]) => {
    // For now we just update locally. 
    // If we need to sync back to DB, we'd add that logic here.
    setMembers(updatedMembers);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <Heading level={2}>Team Members</Heading>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Manage your team members and their roles within this organization.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
        </div>
      ) : (
        <MembersTable 
          members={members} 
          onMembersChange={handleMembersChange}
          currentUserId={user?.uid}
        />
      )}
    </div>
  );
}
