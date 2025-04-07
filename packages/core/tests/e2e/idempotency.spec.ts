import { MemoryStorageAdapter } from "@node-idempotency/storage-adapter-memory";
import {
  HttpHeaderKeysEnum,
  Idempotency,
  type IdempotencyParams,
  type IdempotencyParamsWithDefaults,
} from "../../src";

describe("Idempotency (Integration Test)", () => {
  let idempotency: Idempotency;
  let storage: MemoryStorageAdapter;

  beforeEach(() => {
    storage = new MemoryStorageAdapter();
    idempotency = new Idempotency(storage);
  });

  // Success Cases
  it("should cache request and return response on subsequent request with matching idempotency key", async () => {
    const req = {
      headers: { [HttpHeaderKeysEnum.IDEMPOTENCY_KEY]: "1" },
      path: "/pay",
      body: { a: "a" },
      method: "POST",
    };
    const res = { body: { success: "true" } };
    const idempotencyRes = await idempotency.onRequest(req);
    expect(idempotencyRes).toBeUndefined();

    await idempotency.onResponse(req, res);

    const cachedResponse = await idempotency.onRequest(req);

    expect(cachedResponse).toEqual(res);
  });

  it("should skip the request when method specified returns true", async () => {
    const skipRequest = (request: IdempotencyParamsWithDefaults): boolean => {
      return request.method === "POST";
    };
    let req: IdempotencyParams = {
      headers: { [HttpHeaderKeysEnum.IDEMPOTENCY_KEY]: "2" },
      path: "/pay",
      body: { a: "a" },
      method: "POST",
      options: {
        skipRequest,
      },
    };
    const res = { body: { success: "true" } };
    let idempotencyRes = await idempotency.onRequest(req);
    expect(idempotencyRes).toBeUndefined();

    await idempotency.onResponse(req, res);

    let cachedResponse = await idempotency.onRequest(req);

    expect(cachedResponse).toBeUndefined();

    req = { ...req, method: "GET" };
    idempotencyRes = await idempotency.onRequest(req);
    expect(idempotencyRes).toBeUndefined();

    await idempotency.onResponse(req, res);
    cachedResponse = await idempotency.onRequest(req);

    expect(cachedResponse).toEqual(res);
  });

  it("should allow overriding cacheKeyPrefix", async () => {
    const req: IdempotencyParams = {
      headers: { [HttpHeaderKeysEnum.IDEMPOTENCY_KEY]: "1" },
      path: "/pay",
      body: { a: "a" },
      method: "POST",
      options: {
        cacheKeyPrefix: "tenant-1",
      },
    };
    const res = { body: { success: "true" } };
    const idempotencyRes = await idempotency.onRequest(req);
    expect(idempotencyRes).toBeUndefined();

    await idempotency.onResponse(req, res);

    const cachedResponse = await idempotency.onRequest(req);

    expect(cachedResponse).toEqual(res);

    expect(
      await storage.get(`${req.options?.cacheKeyPrefix}:POST:/pay:1`),
    ).toEqual(
      '{"status":"COMPLETE","fingerPrint":"f45aa7a9803525391d546d331b22b3ed4583a11a04797feaeb1027b158c65d10","response":{"body":{"success":"true"}}}',
    );

    // different tenant with same idempotency key
    const cachedResponse2 = await idempotency.onRequest({
      ...req,
      options: {
        cacheKeyPrefix: "tenant-2",
      },
    });

    expect(cachedResponse2).toBeUndefined();
  });

  it("should allow custom idempotencyKeyExtractor", async () => {
    const req: IdempotencyParams = {
      headers: { "random-idempotency-key": "123" },
      path: "/pay",
      body: { a: "a" },
      method: "POST",
      options: {
        idempotencyKeyExtractor: (req) =>
          req.headers["random-idempotency-key"] as string | undefined,
      },
    };
    const res = { body: { success: "true" } };
    const idempotencyRes = await idempotency.onRequest(req);
    expect(idempotencyRes).toBeUndefined();

    await idempotency.onResponse(req, res);

    const cachedResponse = await idempotency.onRequest(req);

    expect(cachedResponse).toEqual(res);
  });

  // @TODO add more cases
});
