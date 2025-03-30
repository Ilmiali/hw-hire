import { DatabaseFactory } from './factories/databaseFactory';
import { FirestoreDatabase } from './implementations/firestoreDatabase';
import { firestore } from '../firebase/config';

export function registerDatabases(): void {
  const factory = DatabaseFactory.getInstance();

  // Register Firestore implementation
  factory.registerDatabase('firestore', () => new FirestoreDatabase(firestore));

  // Register MongoDB implementation (when available)
  // factory.registerDatabase('mongodb', (config) => new MongoDBDatabase(config));
} 