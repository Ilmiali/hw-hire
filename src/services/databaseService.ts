import { DatabaseEngine, Database, QueryConstraint } from './types/database';
import { DatabaseFactory } from './factories/databaseFactory';

// Database types
export type QueryOperator = '==' | '!=' | '>' | '<' | '>=' | '<=';

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
    return doc ? doc.data as T : null;
  }

  public async getDocuments<T>(collection: string, constraints?: QueryConstraint[]): Promise<T[]> {
    const docs = await this.database.getDocuments(collection, constraints);
    return docs.map(doc => doc.data as T);
  }

  public async buildQuery(collection: string, constraints?: QueryConstraint[]): Promise<unknown> {
    return this.database.buildQuery(collection, constraints);
  }
}

// Export the class and a function to get the instance
export const getDatabaseService = (engine: DatabaseEngine = 'firestore') => DatabaseService.getInstance(engine); 