import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { HEADER_TENANT } from '../config/tenantHeader.config';

interface TenantGuardUser {
  tenantId?: string;
  role?: string;
}

interface TenantGuardRequest extends Request {
  tenantId?: string;
  user?: TenantGuardUser;
}

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<TenantGuardRequest>();

    const headerValue =
      request.get?.(HEADER_TENANT.TENANT_ID) ||
      request.headers?.[HEADER_TENANT.TENANT_ID];
    const tenantIdHeader = Array.isArray(headerValue)
      ? headerValue[0]
      : headerValue;

    if (!tenantIdHeader) {
      throw new BadRequestException('Tenant ID header is required');
    }

    const tenantId = request.tenantId || tenantIdHeader;
    const userTenantId = request.user?.tenantId;
    const userRole = request.user?.role;

    // !SUPER ADMIN bypass
    if (userRole === 'SUPER_ADMIN') {
      request.tenantId = tenantId;
      return true;
    }

    if (userTenantId && tenantId !== userTenantId) {
      throw new ForbiddenException('Tenant ID does not match user tenant');
    }

    request.tenantId = tenantId;

    return true;
  }
}
