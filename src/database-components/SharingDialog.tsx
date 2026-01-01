import { useState, useEffect } from "react";
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

interface SharingDialogProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    title?: string;
    description?: string;
    visibility: 'private' | 'public';
    members: Member[];
    onSave: (data: { visibility: 'private' | 'public', members: Member[] }) => Promise<void>;
    ownerId?: string;
    availableRoles?: string[];
    orgId?: string;
    moduleId?: string;
    currentUserId?: string;
}

export function SharingDialog({
    isOpen,
    onClose,
    title = "Sharing Settings",
    description = "Manage who can view and edit this resource.",
    visibility: initialVisibility,
    members: initialMembers,
    onSave,
    ownerId,
    availableRoles = ['viewer', 'editor', 'owner'],
    orgId,
    moduleId,
    currentUserId
}: SharingDialogProps) {
    const [localVisibility, setLocalVisibility] = useState<'private' | 'public'>(initialVisibility);
    const [localMembers, setLocalMembers] = useState<Member[]>(initialMembers);
    const [isSaving, setIsSaving] = useState(false);

    // Update local state when dialog opens or initial props change
    useEffect(() => {
        if (isOpen) {
            setLocalVisibility(initialVisibility);
            setLocalMembers(initialMembers);
        }
    }, [isOpen, initialVisibility, initialMembers]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({ visibility: localVisibility, members: localMembers });
            onClose(false);
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
                        />
                    </div>

                    {/* Access Management (Private Only) */}
                    {!isPublic && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex flex-col gap-1 px-1">
                                <Label className="text-base">Members with Access</Label>
                                <p className="text-sm text-muted-foreground">
                                    Manage people who have permission to view or edit this resource.
                                </p>
                            </div>
                            
                            <div className="border rounded-md p-1 bg-card">
                                <MembersTable 
                                    members={localMembers}
                                    onMembersChange={setLocalMembers}
                                    ownerId={ownerId}
                                    defineRole={true}
                                    availableRoles={availableRoles}
                                    orgId={orgId}
                                    moduleId={moduleId}
                                    currentUserId={currentUserId}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-6 border-t pt-4">
                    <Button variant="outline" onClick={() => onClose(false)} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
