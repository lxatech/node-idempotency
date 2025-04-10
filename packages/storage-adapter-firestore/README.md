# Firestore Storage Adapter for Node-Idempotency

This package provides a Firestore storage adapter for the node-idempotency library, allowing you to use Google Cloud Firestore as a storage backend for idempotency keys.

## Installation

```bash
npm install @node-idempotency/storage-adapter-firestore
# or
yarn add @node-idempotency/storage-adapter-firestore
```

## Usage

```typescript
import { Idempotency } from "@node-idempotency/core";
import { FirestoreStorageAdapter } from "@node-idempotency/storage-adapter-firestore";

// Create a Firestore storage adapter
const firestoreAdapter = new FirestoreStorageAdapter({
  collection: "idempotency-keys", // Optional, defaults to 'idempotency'
  projectId: "your-project-id",
});

// Create an idempotency instance with the Firestore adapter
const idempotency = new Idempotency(firestoreAdapter, {
  // Your idempotency options here
});

// Use the idempotency instance in your application
```

## Configuration Options

The `FirestoreStorageAdapter` accepts the following options:

- `collection`: (string, optional) - The Firestore collection name to store idempotency keys. Defaults to 'idempotency'.
- `projectId`: (string, optional) - The Google Cloud project ID. If not provided, will use the default from the environment.
- `settings`: (Settings, optional) - Additional Firestore client settings.

## License

MIT
