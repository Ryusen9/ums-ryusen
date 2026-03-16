import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategy/local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entity/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigType } from '@nestjs/config';
import jwtConfig from '../common/config/jwt.config';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  providers: [
    AuthService,
    { provide: HashingProvider, useClass: BcryptProvider },
    LocalStrategy,
    JwtStrategy,
  ],
  controllers: [AuthController],
  imports: [
    ConfigModule.forFeature(jwtConfig),
    UsersModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      inject: [jwtConfig.KEY],
      useFactory: (config: ConfigType<typeof jwtConfig>) => ({
        secret: config.secret,
        signOptions: { expiresIn: config.signOptions?.expiresIn },
      }),
    }),
  ],
  exports: [AuthService, HashingProvider],
})
export class AuthModule {}
