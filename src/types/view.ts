export interface View {
  id: string;
  name: string;
  organizationId: string;
  members: {
    id: string;
    email: string;
    role: 'admin' | 'member';
  }[];
  createdAt: Date;
  updatedAt: Date;
} 