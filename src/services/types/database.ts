// Database types
export type DatabaseEngine = 'firestore' | 'mongodb';

// Query operators
export type QueryOperator = '==' | '!=' | '>' | '<' | '>=' | '<=';
export type QueryConstraint = {
  field: string;
  operator: QueryOperator;
  value: unknown;
};

// Document interface
export interface Document {
  id: string;
  data: unknown;
  createdAt?: Date;
  updatedAt?: Date;
}

// Database interface
export interface Database {
  getDocument(collection: string, id: string): Promise<Document | null>;
  getDocuments(collection: string, constraints?: QueryConstraint[]): Promise<Document[]>;
  buildQuery(collection: string, constraints?: QueryConstraint[]): Promise<unknown>;
} 