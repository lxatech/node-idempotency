import { ConsoleLogger, type DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NodeIdempotencyModule, StorageAdapterEnum } from "../../../../src";
import { TestController } from "./test.controller";
import { IDEMPOTENCY_LOGGER } from "../../../../src/constants";

@Module({})
export class TestModuleMemory {
  static forRootAsync(): DynamicModule {
    return {
      global: true,
      module: TestModuleMemory,
      imports: [
        NodeIdempotencyModule.forRootAsync({
          storage: { adapter: StorageAdapterEnum.memory },
          cacheTTLMS: 1000,
        }),
      ],
      controllers: [TestController],
    };
  }
}

@Module({})
export class TestModuleRedis {
  static forRootAsync(options: { port: number; host: string }): DynamicModule {
    return {
      global: true,
      module: TestModuleRedis,
      controllers: [TestController],
      imports: [
        NodeIdempotencyModule.forRootAsync({
          storage: {
            adapter: StorageAdapterEnum.redis,
            options: {
              url: `redis://${options.host}:${options.port}`,
            },
          },
          cacheTTLMS: 1000,
        }),
      ],
    };
  }
}

@Module({})
export class TestModuleFirestore {
  static forRootAsync(): DynamicModule {
    return {
      global: true,
      module: TestModuleFirestore,
      controllers: [TestController],
      imports: [
        NodeIdempotencyModule.forRootAsync({
          storage: {
            adapter: StorageAdapterEnum.firestore,
            options: {
              collection: "idempotency-test",
              projectId: "",
            },
          },
          cacheTTLMS: 1000,
        }),
      ],
    };
  }
}

@Module({})
export class TestModuleRedisWithFactory {
  static forRootAsync(): DynamicModule {
    return {
      global: true,
      module: TestModuleRedisWithFactory,
      controllers: [TestController],
      imports: [
        NodeIdempotencyModule.forRootAsync({
          imports: [ConfigModule.forRoot()],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return {
              storage: {
                adapter: StorageAdapterEnum.redis,
                options: {
                  url: configService.get("REDIS_URL"),
                },
              },
              cacheTTLMS: 1000,
            };
          },
        }),
      ],
    };
  }
}

@Module({})
export class TestModuleMemoryWithFactory {
  static forRootAsync(): DynamicModule {
    return {
      global: true,
      module: TestModuleMemoryWithFactory,
      controllers: [TestController],
      imports: [
        NodeIdempotencyModule.forRootAsync({
          useFactory: async () => {
            return {
              storage: {
                adapter: StorageAdapterEnum.memory,
              },
              cacheTTLMS: 1000,
            };
          },
        }),
      ],
    };
  }
}

@Module({})
export class TestModuleLogger {
  static forRootAsync(): DynamicModule {
    return {
      global: true,
      module: TestModuleLogger,
      providers: [
        {
          provide: IDEMPOTENCY_LOGGER,
          useValue: new ConsoleLogger("TestIdempotency"),
        },
      ],
      exports: [IDEMPOTENCY_LOGGER],
    };
  }
}
