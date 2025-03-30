export interface Message {
  id: string;
  content: string;
  sender: {
    name: string;
    avatar?: string;
    isCurrentUser: boolean;
  };
  timestamp: string;
} 