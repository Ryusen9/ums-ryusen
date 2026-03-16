import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { AuthUserResponseDto } from './dto/auth-user-response.dto';
import { User } from '../users/entity/users.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(TenantGuard)
  async registerUser(
    @Req() req: { tenantId: string },
    @Body() body: CreateUserDto,
  ): Promise<AuthUserResponseDto> {
    const tenant = req.tenantId;
    const user = await this.authService.createUser(tenant, body);
    return this.authService.toAuthUserResponse(user);
  }

  @Post('login')
  @UseGuards(TenantGuard, LocalAuthGuard)
  loginUser(@Req() req: { user: User }): {
    token: string;
    user: AuthUserResponseDto;
  } {
    const token = this.authService.signToken(req.user);
    return {
      token,
      user: this.authService.toAuthUserResponse(req.user),
    };
  }

  @Post('logout')
  @UseGuards(TenantGuard, LocalAuthGuard)
  logoutUser(@Req() req: { user: User }): AuthUserResponseDto {
    return this.authService.toAuthUserResponse(req.user);
  }
}
