export interface Application {
  id: string;
  subject: string;
  snippet: string;
  channel: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired';
  groupId: string;
  priority: string;
  tags: string[];
  updatedAt: string;
  appliedAt: string;
  assignedTo?: string | null;
  candidate: {
    email: string;
    name: string;
  }
} 