export interface Ticket {
  id: string;
  subject: string;
  snippet: string;
  channel: string;
  status: 'new' | 'open' | 'closed' | 'pending' | 'resolved' | 'archived';
  groupId: string;
  priority: string;
  tags: string[];
  updatedAt: Date;
  requestedAt: Date;
  assignedTo?: string | null;
  requestedBy: {
    email: string;
    name: string;
  }
} 