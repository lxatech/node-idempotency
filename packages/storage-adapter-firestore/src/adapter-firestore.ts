import { Firestore, Timestamp } from "@google-cloud/firestore";
import { type StorageAdapter } from "@node-idempotency/storage";
import { type FirestoreStorageAdapterOptions } from "./types";

export class FirestoreStorageAdapter implements StorageAdapter {
  private readonly firestore: Firestore;
  private readonly collection: string;

  constructor(options?: FirestoreStorageAdapterOptions) {
    const { collection = "idempotency", settings, projectId } = options ?? {};

    this.collection = collection;
    this.firestore = new Firestore({
      projectId,
      ...settings,
    });
  }

  async connect(): Promise<void> {
    // Firestore client doesn't require explicit connection
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    try {
      await this.firestore.terminate();
    } catch (err) {
      console.warn(`Failed to terminate Firestore client`, err);
    }
  }

  async setIfNotExists(
    key: string,
    val: string,
    { ttl }: { ttl?: number } = {},
  ): Promise<boolean> {
    const encodedKey = encodeURIComponent(key);
    const docRef = this.firestore.collection(this.collection).doc(encodedKey);

    return await this.firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);

      if (doc.exists) {
        // Check if the document has expired
        const data = doc.data();

        if (data?.expiresAt && data.expiresAt.toDate() < new Date()) {
          // Document exists but has expired, so we can set it
          await this.setDocumentWithTTL(transaction, docRef, key, val, ttl);
          return true;
        }
        // Document exists and is not expired
        return false;
      }

      // Document doesn't exist, so we can set it
      await this.setDocumentWithTTL(transaction, docRef, key, val, ttl);
      return true;
    });
  }

  async set(
    key: string,
    val: string,
    { ttl }: { ttl?: number },
  ): Promise<void> {
    const encodedKey = encodeURIComponent(key);
    const docRef = this.firestore.collection(this.collection).doc(encodedKey);

    await this.setDocumentWithTTL(null, docRef, key, val, ttl);
  }

  async get(key: string): Promise<string | undefined> {
    const encodedKey = encodeURIComponent(key);
    const docRef = this.firestore.collection(this.collection).doc(encodedKey);
    const doc = await docRef.get();

    if (!doc.exists) {
      return undefined;
    }

    const data = doc.data();

    // Check if the document has expired
    if (data?.expiresAt && data.expiresAt.toDate() < new Date()) {
      await docRef.delete();
      return undefined;
    }

    return data?.value;
  }

  private setDocumentWithTTL(
    transaction: FirebaseFirestore.Transaction | null,
    docRef: FirebaseFirestore.DocumentReference,
    idempotencyKey: string,
    val: string,
    ttl?: number,
  ): Promise<void> | void {
    const data: Record<string, any> = {
      idempotencyKey,
      value: val,
      createdAt: Timestamp.now(),
    };

    if (ttl !== undefined && !isNaN(ttl)) {
      const expirationDate = new Date();
      expirationDate.setMilliseconds(expirationDate.getMilliseconds() + ttl);
      data.expiresAt = Timestamp.fromDate(expirationDate);
    }

    if (transaction) {
      transaction.set(docRef, data);
      return;
    }

    return docRef.set(data).then(() => {});
  }
}
