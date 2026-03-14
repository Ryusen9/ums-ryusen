import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class HashingProvider {
  abstract hashPassword(p: string | Buffer): Promise<string>;
  abstract comparePassword(p: string | Buffer, h: string): Promise<boolean>;
}
