import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
} from "@nestjs/common";
import { Idempotent } from "../../../../src";

@Controller()
@Idempotent({ keyMaxLength: 3, enforceIdempotency: true })
export class TestController {
  counter = 0;
  slowCounter = 0;
  slowCounterForFirestore = 0;
  adCounter = 0;

  @Get()
  getNumber(): number {
    return this.counter++;
  }

  @Get("/slow")
  async getSlowNumber(): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return this.slowCounter++;
  }

  @Get("/slow-for-firestore")
  async getSlowNumberForFirestore(): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return this.slowCounterForFirestore++;
  }

  @Get("/error")
  async getError(): Promise<void> {
    throw new BadRequestException();
  }

  @Post("/add")
  @HttpCode(201)
  async addNumber(@Body() { number }: { number: number }): Promise<number> {
    this.adCounter += number;
    return this.adCounter;
  }
}
