import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchAccess, grantAccess, revokeAccess } from '../store/slices/shareSlice';
import { updateResourceSettings } from '../store/slices/resourceSlice';
import { getDatabaseService } from '../services/databaseService';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MembersTable, Member } from './MembersTable';
import { AccessRole } from '../types/access';
import { toast } from 'react-toastify';

interface SharingDialogProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    title?: string;
    description?: string;
    visibility: 'private' | 'public';
    ownerIds: string[];
    availableRoles?: string[];
    orgId: string;
    moduleId: string;
    resourceType: string;
    resourceId: string;
    currentUserId?: string;
}

export function SharingDialog({
    isOpen,
    onClose,
    title = "Sharing Settings",
    description = "Manage who can view and edit this resource.",
    visibility: initialVisibility,
    ownerIds,
    availableRoles = ['viewer', 'editor', 'owner'],
    orgId,
    moduleId,
    resourceType,
    resourceId,
    currentUserId
}: SharingDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { accessList, loading: isAccessLoading } = useSelector((state: RootState) => state.share);
    
    const [localVisibility, setLocalVisibility] = useState<'private' | 'public'>(initialVisibility);
    // mapped members with details
    const [members, setMembers] = useState<Member[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);

    // Initial load: Fetch access list when dialog opens
    useEffect(() => {
        if (isOpen && orgId && moduleId && resourceType && resourceId) {
            dispatch(fetchAccess({ orgId, moduleId, resourceType, resourceId }));
        }
    }, [isOpen, orgId, moduleId, resourceType, resourceId, dispatch]);

    // Update local visibility when prop changes
    useEffect(() => {
        if (isOpen) {
            setLocalVisibility(initialVisibility);
        }
    }, [isOpen, initialVisibility]);

    // Fetch user details whenever accessList or ownerIds change
    useEffect(() => {
        const fetchDetails = async () => {
            // Combine owners and accessList
            const ownerAccessItems = ownerIds.map(uid => ({
                uid,
                role: 'owner' as AccessRole,
                addedAt: new Date().toISOString(), // Mocking date for owners for now
                addedBy: ''
            }));

            const combinedAccess = [...ownerAccessItems, ...accessList];
            
            // Deduplicate (unlikely but good for safety)
            const uniqueAccess = Array.from(new Map(combinedAccess.map(a => [a.uid, a])).values());

            if (uniqueAccess.length === 0) {
                 setMembers([]);
                 setIsDetailsLoading(false);
                 return;
            }

            setIsDetailsLoading(true);
            const db = getDatabaseService();
            const details = await Promise.all(uniqueAccess.map(async (access) => {
                try {
                    const userDoc = await db.getDocument<{ data: any }>('users', access.uid);
                    const userData = userDoc?.data || {};
                    return {
                        id: access.uid,
                        name: userData.fullName || userData.name || 'Unknown User',
                        email: userData.email || '',
                        avatarUrl: userData.avatarUrl || userData.photoURL,
                        role: access.role as any,
                        addedAt: access.addedAt
                    };
                } catch (e) {
                    return {
                        id: access.uid,
                        name: 'Unknown User',
                        email: '',
                        role: access.role as any,
                        addedAt: access.addedAt
                    };
                }
            }));
            setMembers(details);
            setIsDetailsLoading(false);
        };
        fetchDetails();
    }, [accessList, ownerIds]);

    const isLoading = isAccessLoading || isDetailsLoading;
    const isOwner = !!currentUserId && ownerIds.includes(currentUserId);


    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Update visibility if changed
            if (localVisibility !== initialVisibility) {
                await dispatch(updateResourceSettings({ 
                    orgId, 
                    moduleId, 
                    resourceType, 
                    resourceId, 
                    settings: { visibility: localVisibility } 
                })).unwrap();
            }

            // Source of truth: combination of ownerIds (props) and accessList (redux)
            const originalOwners = ownerIds.map(uid => ({ id: uid, role: 'owner' }));
            const originalOthers = accessList.map(a => ({ id: a.uid, role: a.role }));
            const originalMembers = [...originalOwners, ...originalOthers];

            const currentUids = members.map(m => m.id);
            const originalUids = originalMembers.map(m => m.id);

            // Added or Updated
            const toAddOrUpdate = members.filter(m => {
                const original = originalMembers.find(o => o.id === m.id);
                return !original || original.role !== m.role;
            });

            // Removed
            const removedUids = originalUids.filter(uid => !currentUids.includes(uid));

            // Execute changes
            const promises = [];
            
            for (const m of toAddOrUpdate) {
                promises.push(dispatch(grantAccess({ 
                    orgId, 
                    moduleId, 
                    resourceType, 
                    resourceId, 
                    userId: m.id, 
                    role: m.role as AccessRole 
                })).unwrap());
            }

            for (const uid of removedUids) {
                promises.push(dispatch(revokeAccess({ 
                    orgId, 
                    moduleId, 
                    resourceType, 
                    resourceId, 
                    userId: uid 
                })).unwrap());
            }

            if (promises.length > 0) {
                await Promise.all(promises);
            }

            toast.success('Sharing settings saved');
            onClose(false);
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to save sharing settings');
        } finally {
            setIsSaving(false);
        }
    };

    const isPublic = localVisibility === 'public';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                className="sm:max-w-[600px]"
            >
                <DialogHeader className="mb-4">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8">
                    {/* General Settings */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                        <div className="space-y-0.5">
                            <Label htmlFor="public-toggle" className="text-base">Public Access</Label>
                            <p className="text-sm text-muted-foreground">
                                {isPublic 
                                    ? "Anyone with the link can view this." 
                                    : "Only specific members can access this."}
                            </p>
                        </div>
                        <Switch 
                            id="public-toggle"
                            checked={isPublic}
                            onCheckedChange={(checked) => setLocalVisibility(checked ? 'public' : 'private')}
                            disabled={!isOwner}
                        />
                    </div>

                    {!isOwner && (
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200">
                            Only owners can modify sharing settings and visibility. 
                            Your current view is read-only.
                        </div>
                    )}

                    {/* Access Management (Private Only) */}
                    {!isPublic && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex flex-col gap-1 px-1">
                                <Label className="text-base">Members with Access</Label>
                                <p className="text-sm text-muted-foreground">
                                    Manage people who have permission to view or edit this resource.
                                </p>
                            </div>
                            
                            <div className="border rounded-md p-1 bg-card min-h-[200px] flex flex-col">
                                {isLoading ? (
                                    <div className="flex-1 flex items-center justify-center p-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
                                    </div>
                                ) : (
                                    <MembersTable 
                                        members={members}
                                        onMembersChange={setMembers}
                                        ownerIds={ownerIds}
                                        defineRole={true}
                                        availableRoles={availableRoles}
                                        orgId={orgId}
                                        moduleId={moduleId}
                                        currentUserId={currentUserId}
                                        isOwner={isOwner}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-6 border-t pt-4">
                    <Button variant="outline" onClick={() => onClose(false)} disabled={isSaving}>
                        {isOwner ? "Cancel" : "Close"}
                    </Button>
                    {isOwner && (
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
