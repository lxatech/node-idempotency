import { type Settings } from "@google-cloud/firestore";

export interface FirestoreStorageAdapterOptions {
  /**
   * Collection name to store idempotency keys
   * @default 'idempotency'
   */
  collection?: string;

  /**
   * Project ID for Firestore
   */
  projectId?: string;

  /**
   * Firestore settings
   */
  settings?: Settings;
}
