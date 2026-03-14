import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

interface PermissionGuardRequest {
  user?: {
    permissions?: string[];
    roles?: string[];
  };
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private requiredPermission: string) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<PermissionGuardRequest>();
    const user = request.user;

    // !SUPER ADMIN bypass
    if (user?.roles?.includes('SUPER_ADMIN')) {
      return true;
    }

    if (
      !user ||
      !user.permissions ||
      !user.permissions.includes(this.requiredPermission)
    ) {
      throw new ForbiddenException(
        'User does not have the required permission',
      );
    }
    return true;
  }
}
