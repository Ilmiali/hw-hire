// Database types
export type DatabaseEngine = 'firestore' | 'mongodb';

// Query operators
export type QueryOperator = '==' | '!=' | '>' | '<' | '>=' | '<=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
export type SortOrder = 'asc' | 'desc';

// Query options
export interface QueryOptions {
  constraints?: QueryConstraint[];
  sortBy?: {
    field: string;
    order: SortOrder;
  };
  limit?: number;
  startAfter?: unknown;
}

export type QueryConstraint = {
  field: string;
  operator: QueryOperator;
  value: unknown;
};

// Document interface
export interface Document {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

// Database interface
export interface Database {
  getDocument(collection: string, id: string): Promise<Document | null>;
  getDocuments(collection: string, options?: QueryOptions): Promise<Document[]>;
  addDocument(collection: string, data: Record<string, unknown>): Promise<Document>;
  setDocument(collection: string, id: string, data: Record<string, unknown>): Promise<Document>;
  updateDocument(collection: string, id: string, data: Record<string, unknown>): Promise<Document>;
  deleteDocument(collection: string, id: string): Promise<void>;
  buildQuery(collection: string, options?: QueryOptions): Promise<unknown>;
  onDocumentChange(collection: string, id: string, callback: (document: Document | null) => void): () => void;
} 