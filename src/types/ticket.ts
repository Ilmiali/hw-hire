export interface Ticket {
  id: string;
  subject: string;
  snippet: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  createdBy: string;
} 