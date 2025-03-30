import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  Query as FirestoreQuery,
  DocumentData,
  Firestore
} from 'firebase/firestore';
import { Database, Document, QueryConstraint } from '../types/database';

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
    return {
      id: docSnap.id,
      data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    };
  }

  async getDocuments(collectionName: string, constraints?: QueryConstraint[]): Promise<Document[]> {
    const q = await this.buildQuery(collectionName, constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreDocumentData;
      return {
        id: doc.id,
        data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    });
  }

  async buildQuery(collectionName: string, constraints?: QueryConstraint[]): Promise<FirestoreQuery<DocumentData>> {
    const collectionRef = collection(this.db, collectionName);
    
    if (!constraints || constraints.length === 0) {
      return collectionRef;
    }

    const queryConstraints = constraints.map(constraint => 
      where(constraint.field, constraint.operator, constraint.value)
    );

    return query(collectionRef, ...queryConstraints);
  }
} 