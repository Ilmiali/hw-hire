export interface Application {
  id: string;
  subject: string;
  snippet: string;
  channel: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired';
  groupId: string;
  priority: string;
  tags: string[];
  updatedAt: Date;
  appliedAt: Date;
  assignedTo?: string | null;
  candidate: {
    email: string;
    name: string;
  }
} 