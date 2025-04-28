import { DatabaseEngine, Database, QueryConstraint } from '../types/database';
import { DatabaseFactory } from './factories/databaseFactory';

// Database types
export type QueryOperator = '==' | '!=' | '>' | '<' | '>=' | '<=';
export type SortOrder = 'asc' | 'desc';

// Query options interface
export interface QueryOptions {
  constraints?: QueryConstraint[];
  sortBy?: {
    field: string;
    order: SortOrder;
  };
  limit?: number;
  startAfter?: unknown;
}

// Document interface
export interface Document {
  id: string;
  data: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Database service class
export class DatabaseService {
  private static instance: DatabaseService;
  private database: Database;

  private constructor(engine: DatabaseEngine = 'firestore') {
    this.database = DatabaseFactory.getInstance().getDatabase(engine);
  }

  public static getInstance(engine: DatabaseEngine = 'firestore'): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService(engine);
    }
    return DatabaseService.instance;
  }

  public async getDocument<T>(collection: string, id: string): Promise<T | null> {
    const doc = await this.database.getDocument(collection, id);
    return doc ? doc as T : null;
  }

  public async getDocuments<T>(collection: string, options: QueryOptions = {}): Promise<T[]> {
    const { constraints, sortBy, limit, startAfter } = options;
    let docs = await this.database.getDocuments(collection, { constraints, sortBy, limit, startAfter });
    
    // Apply sorting if specified
    if (sortBy) {
      docs = this.sortDocuments(docs, sortBy.field, sortBy.order);
    }
    
    // Apply limit if specified
    if (limit !== undefined) {
      docs = docs.slice(0, limit);
    }
    
    return docs.map(doc => doc as T);
  }

  public async addDocument<T>(collection: string, data: Omit<T, 'id'>): Promise<T> {
    const doc = await this.database.addDocument(collection, data);
    return doc as T;
  }

  private sortDocuments(docs: Document[], field: string, order: SortOrder): Document[] {
    return [...docs].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      
      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const comparison = aValue < bValue ? -1 : 1;
      return order === 'asc' ? comparison : -comparison;
    });
  }

  public async buildQuery(collection: string, constraints?: QueryConstraint[]): Promise<unknown> {
    return this.database.buildQuery(collection, constraints);
  }

  public async updateDocument<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    const doc = await this.database.updateDocument(collection, id, data);
    return doc as T;
  }

  public onDocumentChange<T>(collection: string, id: string, callback: (document: T | null) => void): () => void {
    return this.database.onDocumentChange(collection, id, (document) => {
      callback(document as T);
    });
  }
}

// Export the class and a function to get the instance
export const getDatabaseService = (engine: DatabaseEngine = 'firestore') => DatabaseService.getInstance(engine); 