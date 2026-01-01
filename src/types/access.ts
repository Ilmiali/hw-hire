export type AccessRole = 'viewer' | 'editor' | 'owner';

export interface Access {
  uid: string; // The user ID this access record belongs to (document ID)
  role: AccessRole;
  addedAt: string;
  addedBy: string;
}
