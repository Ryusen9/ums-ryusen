import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';

@Module({
  providers: [
    AuthService,
    { provide: HashingProvider, useClass: BcryptProvider },
  ],
  controllers: [AuthController],
  imports: [],
  exports: [AuthService, HashingProvider],
})
export class AuthModule {}
