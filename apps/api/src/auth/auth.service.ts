import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { HashingProvider } from './providers/hashing.provider';
import { User } from '../users/entity/users.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthUserResponseDto } from './dto/auth-user-response.dto';
import { JwtService } from '@nestjs/jwt';

type JwtPayload = {
  sub: string;
  email: string;
  tenantId: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingProvider: HashingProvider,
    private readonly jwtService: JwtService,
  ) {}

  public async createUser(tenant: string, body: CreateUserDto): Promise<User> {
    const existingUser = await this.usersService.findByEmail(
      tenant,
      body.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashPassword = await this.hashingProvider.hashPassword(body.password);
    return this.usersService.createUser(tenant, {
      ...body,
      password: hashPassword,
    });
  }

  public toAuthUserResponse(user: User): AuthUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      tenantId: user.tenant?.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  public async validateUser(
    tenant: string,
    email: string,
    password: string,
  ): Promise<User> {
    const user = await this.usersService.findByEmail(tenant, email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!password || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashingProvider.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  public signToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenant?.id,
    };

    return this.jwtService.sign(payload);
  }
}
