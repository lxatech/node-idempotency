import { type IdempotencyOptions } from "@node-idempotency/core";
import { type StorageAdapter } from "@node-idempotency/storage";
import { type RedisStorageAdapterOptions } from "@node-idempotency/storage-adapter-redis";
import { type FirestoreStorageAdapterOptions } from "@node-idempotency/storage-adapter-firestore";
export enum StorageAdapterEnum {
  memory = "memory",
  redis = "redis",
  firestore = "firestore",
}
export type StorageAdapterOptions =
  | RedisStorageAdapterOptions
  | FirestoreStorageAdapterOptions;

export interface StorageAdapterArg {
  adapter: StorageAdapterEnum | StorageAdapter;
  options?: StorageAdapterOptions;
}
export type IdempotencyPluginOptions = IdempotencyOptions & {
  storage: StorageAdapterArg;
};
