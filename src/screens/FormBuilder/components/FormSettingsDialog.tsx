import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchFormAccess, grantFormAccess, revokeFormAccess, updateFormSettings } from '../../../store/slices/formsSlice';
import { getDatabaseService } from '../../../services/databaseService';
import { AccessRole } from '../../../types/access';
import { toast } from 'react-toastify';
import { SharingDialog } from '../../../database-components/SharingDialog';
import { Member } from '../../../database-components/MembersTable';

interface FormSettingsDialogProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    orgId: string;
    formId: string;
}

interface UserProfile {
    uid: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

export default function FormSettingsDialog({ isOpen, onClose, orgId, formId }: FormSettingsDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { currentForm, currentFormAccess } = useSelector((state: RootState) => state.forms);
    
    // Access State
    const [accessListWithDetails, setAccessListWithDetails] = useState<(UserProfile & { role: AccessRole, addedAt: string })[]>([]);

    // Initial load
    useEffect(() => {
        if (isOpen && orgId && formId) {
            dispatch(fetchFormAccess({ orgId, formId }));
        }
    }, [isOpen, orgId, formId, dispatch]);

    // Fetch user details when access list changes
    useEffect(() => {
        const fetchDetails = async () => {
            if (!currentFormAccess || currentFormAccess.length === 0) {
                setAccessListWithDetails([]);
                return;
            }

            const db = getDatabaseService();
            const details = await Promise.all(currentFormAccess.map(async (access) => {
                try {
                    const userDoc = await db.getDocument<{ data: any }>('users', access.uid);
                    const userData = userDoc?.data || {};
                    return {
                        uid: access.uid,
                        name: userData.fullName || userData.name || 'Unknown User',
                        email: userData.email || '',
                        avatarUrl: userData.avatarUrl || userData.photoURL,
                        role: access.role,
                        addedAt: access.addedAt
                    };
                } catch (e) {
                    return {
                        uid: access.uid,
                        name: 'Unknown User',
                        email: '',
                        role: access.role,
                        addedAt: access.addedAt
                    };
                }
            }));
            setAccessListWithDetails(details);
        };
        fetchDetails();
    }, [currentFormAccess]);

    const handleSave = async (data: { visibility: 'private' | 'public', members: Member[] }) => {
        try {
            // 1. Update visibility if changed
            if (data.visibility !== (currentForm?.visibility || 'private')) {
                await dispatch(updateFormSettings({ orgId, formId, visibility: data.visibility })).unwrap();
            }

            // 2. Diff members
            const originalUids = currentFormAccess.map(a => a.uid);
            const newUids = data.members.map(m => m.id);

            // Added or Updated
            const toAddOrUpdate = data.members.filter(m => {
                const original = currentFormAccess.find(a => a.uid === m.id);
                return !original || original.role !== m.role;
            });

            // Removed
            const removedUids = originalUids.filter(uid => !newUids.includes(uid));

            // Execute changes
            const promises = [];
            
            for (const m of toAddOrUpdate) {
                promises.push(dispatch(grantFormAccess({ 
                    orgId, 
                    formId, 
                    userId: m.id, 
                    role: m.role as AccessRole 
                })).unwrap());
            }

            for (const uid of removedUids) {
                promises.push(dispatch(revokeFormAccess({ orgId, formId, userId: uid })).unwrap());
            }

            if (promises.length > 0) {
                await Promise.all(promises);
            }

            toast.success('Sharing settings saved');
        } catch (error: any) {
            toast.error('Failed to save sharing settings: ' + error.message);
            throw error; // Rethrow so SharingDialog knows it failed
        }
    };

    // Map accessListWithDetails to Member[] for SharingDialog
    const members: Member[] = accessListWithDetails.map(item => ({
        id: item.uid,
        name: item.name,
        email: item.email,
        role: item.role,
        avatarUrl: item.avatarUrl
    }));

    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <SharingDialog 
            isOpen={isOpen}
            onClose={onClose}
            title="Sharing"
            description="Manage who can view and edit this form."
            visibility={currentForm?.visibility || 'private'}
            members={members}
            onSave={handleSave}
            ownerId={currentForm?.ownerIds?.[0]}
            availableRoles={['viewer', 'editor', 'owner']}
            orgId={orgId}
            moduleId="hire"
            currentUserId={user?.uid}
        />
    );
}
