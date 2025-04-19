export interface Group {
  id: string;
  name: string;
  organizationId: string;
  totalNumTickets: number;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
} 