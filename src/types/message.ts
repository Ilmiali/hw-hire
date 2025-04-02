export interface Message {
  id: string;
  content: string;
  cc: {
    email: string;
    name?: string;
    avatar?: string;
  }[];
  bcc: {
    email: string;
    name?: string;
    avatar?: string;
  }[];
  from: {
    email: string;
    name?: string;
    avatar?: string;
  },
  to: {
    email: string;
    name?: string;
    avatar?: string;
  },
  sentAt: Date;
  ticketId: string;
}