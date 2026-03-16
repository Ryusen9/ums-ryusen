import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserQueryDto } from './dto/query-user.dto';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { TenantGuard } from '../common/guards/tenant.guard';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

interface TenantRequest {
  tenantId: string;
}

interface TenantUserRequest extends TenantRequest {
  user?: { id: string };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  listUsers(@Req() req: TenantRequest, @Query() query: UserQueryDto) {
    const tenant = req.tenantId;
    return this.usersService.listUsers(tenant, query);
  }

  @Get(':id')
  @UseGuards(TenantGuard, JwtAuthGuard)
  getUserById(@Req() req: TenantUserRequest, @Param('id') id: string) {
    const tenant = req.tenantId;
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    if (userId !== id) {
      throw new UnauthorizedException('User can only access their own data');
    }
    return this.usersService.findById(tenant, id);
  }

  @Get(':email')
  @UseGuards(TenantGuard, JwtAuthGuard)
  getUserByEmail(@Req() req: TenantUserRequest, @Param('email') email: string) {
    const tenant = req.tenantId;
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.usersService.findByEmail(tenant, email);
  }

  @Post()
  createUser(@Req() req: TenantRequest, @Body() body: CreateUserDto) {
    const tenant = req.tenantId;
    return this.usersService.createUser(tenant, body);
  }

  @Patch(':id')
  updateUser(
    @Req() req: TenantRequest,
    @Param('id') id: string,
    @Body() body: Partial<CreateUserDto>,
  ) {
    const tenant = req.tenantId;
    return this.usersService.updateUser(tenant, id, body);
  }

  @Delete(':id')
  deleteUser(@Req() req: TenantRequest, @Param('id') id: string) {
    const tenant = req.tenantId;
    return this.usersService.deleteUser(tenant, id);
  }
}
