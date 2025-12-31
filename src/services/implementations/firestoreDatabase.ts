import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  Query as FirestoreQuery,
  DocumentData,
  Firestore,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { Database, Document, QueryOptions } from '../../types/database';

interface FirestoreDocumentData extends DocumentData {
  createdAt?: { toDate: () => Date };
  updatedAt?: { toDate: () => Date };
}

export class FirestoreDatabase implements Database {
  private db: Firestore;

  constructor(firestore: Firestore) {
    this.db = firestore;
  }

  async getDocument(collectionName: string, id: string): Promise<Document | null> {
    const docRef = doc(this.db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data() as FirestoreDocumentData;
    const { createdAt, updatedAt, ...rest } = data;
    
    return {
      id: docSnap.id,
      data: rest,
      createdAt: createdAt?.toDate(),
      updatedAt: updatedAt?.toDate()
    };
  }

  async getDocuments(collectionName: string, options?: QueryOptions): Promise<Document[]> {
    const q = await this.buildQuery(collectionName, options);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreDocumentData;
      const { createdAt, updatedAt, ...rest } = data;
      
      return {
        id: doc.id,
        data: rest,
        createdAt: createdAt?.toDate(),
        updatedAt: updatedAt?.toDate()
      };
    });
  }

  async addDocument(collectionName: string, data: Record<string, unknown>): Promise<Document> {
    const collectionRef = collection(this.db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return {
      id: docRef.id,
      data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async setDocument(collectionName: string, id: string, data: Record<string, unknown>): Promise<Document> {
    const docRef = doc(this.db, collectionName, id);
    await setDoc(docRef, {
      ...data,
      createdAt: new Date(), // We might want to preserve original createdAt if it exists in data, but for now new Date
      updatedAt: new Date()
    }, { merge: true }); // Merge true to behave like upsert/update
    
    // For set, we usually want to return what we wrote.
    return {
      id,
      data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateDocument(collectionName: string, id: string, data: Record<string, unknown>): Promise<Document> {
    const docRef = doc(this.db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
    
    // Fetch the updated document to return
    const updatedDoc = await this.getDocument(collectionName, id);
    if (!updatedDoc) {
      throw new Error('Failed to fetch updated document');
    }
    
    return updatedDoc;
  }

  async deleteDocument(collectionName: string, id: string): Promise<void> {
    const docRef = doc(this.db, collectionName, id);
    await deleteDoc(docRef);
  }

  async buildQuery(collectionName: string, options?: QueryOptions): Promise<FirestoreQuery<DocumentData>> {
    const collectionRef = collection(this.db, collectionName);
    const queryConstraints = [];

    // Add where constraints if they exist
    if (options?.constraints) {
      queryConstraints.push(
        ...options.constraints.map(constraint => 
          where(constraint.field, constraint.operator, constraint.value)
        )
      );
    }

    // Add sorting if specified
    if (options?.sortBy) {
      queryConstraints.push(
        orderBy(options.sortBy.field, options.sortBy.order)
      );
    }

    // Add limit if specified
    if (options?.limit !== undefined) {
      queryConstraints.push(
        firestoreLimit(options.limit)
      );
    }

    // Add startAfter for pagination if specified
    if (options?.startAfter) {
      queryConstraints.push(
        startAfter(options.startAfter)
      );
    }

    return query(collectionRef, ...queryConstraints);
  }

  onDocumentChange(collectionName: string, id: string, callback: (document: Document | null) => void): () => void {
    const docRef = doc(this.db, collectionName, id);
    
    return onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) {
        callback(null);
        return;
      }

      const data = docSnap.data() as FirestoreDocumentData;
      const { createdAt, updatedAt, ...rest } = data;
      
      const document: Document = {
        id: docSnap.id,
        data: rest,
        createdAt: createdAt?.toDate(),
        updatedAt: updatedAt?.toDate()
      };
      
      callback(document);
    });
  }
} 