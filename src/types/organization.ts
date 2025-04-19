export interface Organization {
  id: string;
  name: string;
  members: {
    id: string;
    email: string;
    role: 'admin' | 'member';
  }[];
  createdAt: Date;
  updatedAt: Date;
} 