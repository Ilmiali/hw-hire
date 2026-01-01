import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { updateFormSettings } from '../../../store/slices/formsSlice';
import { SharingDialog } from '../../../database-components/SharingDialog';

interface FormSettingsDialogProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    orgId: string;
    formId: string;
}

export default function FormSettingsDialog({ isOpen, onClose, orgId, formId }: FormSettingsDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { currentForm } = useSelector((state: RootState) => state.forms);
    const { user } = useSelector((state: RootState) => state.auth);

    const handleVisibilityChange = async (visibility: 'private' | 'public') => {
        if (visibility !== (currentForm?.visibility || 'private')) {
            await dispatch(updateFormSettings({ orgId, formId, visibility })).unwrap();
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
            ownerId={currentForm?.ownerIds?.[0]}
            availableRoles={['viewer', 'editor', 'owner']}
            orgId={orgId}
            moduleId="hire"
            resourceType="forms"
            resourceId={formId}
            currentUserId={user?.uid}
        />
    );
}
