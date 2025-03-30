import { DatabaseEngine, Database } from '../types/database';

export class DatabaseFactory {
  private static instance: DatabaseFactory;
  private databaseInstances: Map<DatabaseEngine, Database> = new Map();
  private databaseConstructors: Map<DatabaseEngine, (config?: unknown) => Database> = new Map();

  private constructor() {}

  public static getInstance(): DatabaseFactory {
    if (!DatabaseFactory.instance) {
      DatabaseFactory.instance = new DatabaseFactory();
    }
    return DatabaseFactory.instance;
  }

  public registerDatabase(engine: DatabaseEngine, constructor: (config?: unknown) => Database): void {
    this.databaseConstructors.set(engine, constructor);
  }

  public getDatabase(engine: DatabaseEngine, config?: unknown): Database {
    if (!this.databaseConstructors.has(engine)) {
      throw new Error(`No database implementation registered for engine: ${engine}`);
    }

    if (!this.databaseInstances.has(engine)) {
      const constructor = this.databaseConstructors.get(engine)!;
      this.databaseInstances.set(engine, constructor(config));
    }

    return this.databaseInstances.get(engine)!;
  }
} 