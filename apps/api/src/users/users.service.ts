import { BadGatewayException, Injectable } from '@nestjs/common';
import { UserQueryDto } from './dto/query-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/users.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async listUsers(tenant: string, query: UserQueryDto) {
    const limit = query.limit || 10;
    const offset = query.offset || 0;
    const page = query.page || 1;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const res = await this.userRepo.find({
      where: { tenant: { id: tenant } },
      order: { [sortBy]: sortOrder.toUpperCase() },
      skip: offset + (page - 1) * limit,
      take: limit,
    });
    return res;
  }

  async findByEmail(tenant: string, email: string) {
    return this.userRepo.findOne({
      where: { email, tenant: { id: tenant } },
    });
  }

  async findById(tenant: string, id: string) {
    return this.userRepo.findOne({
      where: { id, tenant: { id: tenant } },
    });
  }

  async createUser(tenant: string, body: CreateUserDto) {
    const user = this.userRepo.create({
      ...body,
      tenant: { id: tenant },
    });
    return this.userRepo.save(user);
  }

  async deleteUser(tenant: string, id: string) {
    const user = await this.findById(tenant, id);
    if (!user) {
      throw new BadGatewayException('User not found');
    }
    return this.userRepo.remove(user);
  }

  async updateUser(tenant: string, id: string, body: Partial<CreateUserDto>) {
    const user = await this.findById(tenant, id);
    if (!user) {
      throw new BadGatewayException('User not found');
    }
    Object.assign(user, body);
    return this.userRepo.save(user);
  }
}
