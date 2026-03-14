import { Injectable } from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptProvider implements HashingProvider {
  async hashPassword(p: string | Buffer): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(p, salt);
  }

  async comparePassword(p: string | Buffer, h: string): Promise<boolean> {
    return await bcrypt.compare(p, h);
  }
}
