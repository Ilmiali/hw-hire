export interface Ticket {
  id: string;
  subject: string;
  snippet: string;
  status: 'open' | 'closed';
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  requestedAt: Date;
  assignedTo?: string;
  from: Array<{
    email: string;
    name: string;
  }>;
  to: Array<{
    email: string;
    name: string;
  }>;
} 