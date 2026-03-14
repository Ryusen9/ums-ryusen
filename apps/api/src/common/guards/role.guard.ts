import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

interface RoleGuardRequest {
  user?: {
    role?: string[];
  };
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private requiredRole: string) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<RoleGuardRequest>();
    const user = request.user;

    // !SUPER ADMIN bypass
    if (user?.role?.includes('SUPER_ADMIN')) {
      return true;
    }

    if (!user || !user.role || !user.role.includes(this.requiredRole)) {
      throw new ForbiddenException('User does not have the required role');
    }

    return true;
  }
}
