import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { updateResourceSettings } from '../../../store/slices/resourceSlice';
import { SharingDialog } from '../../../database-components/SharingDialog';

interface FormSettingsDialogProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    orgId: string;
    formId: string;
}

export default function FormSettingsDialog({ isOpen, onClose, orgId, formId }: FormSettingsDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { activeResource: currentForm } = useSelector((state: RootState) => state.resource);
    const { user } = useSelector((state: RootState) => state.auth);

    const handleVisibilityChange = async (visibility: 'private' | 'public') => {
        if (visibility !== (currentForm?.visibility || 'private')) {
            await dispatch(updateResourceSettings({ 
                orgId, 
                moduleId: 'hire', 
                resourceType: 'forms', 
                resourceId: formId, 
                settings: { visibility } 
            })).unwrap();
        }
    };

    return (
        <SharingDialog 
            isOpen={isOpen}
            onClose={onClose}
            title="Sharing"
            description="Manage who can view and edit this form."
            visibility={currentForm?.visibility || 'private'}
            onVisibilityChange={handleVisibilityChange}
            ownerIds={currentForm?.ownerIds || []}
            availableRoles={['viewer', 'editor', 'owner']}
            orgId={orgId}
            moduleId="hire"
            resourceType="forms"
            resourceId={formId}
            currentUserId={user?.uid}
        />
    );
}
