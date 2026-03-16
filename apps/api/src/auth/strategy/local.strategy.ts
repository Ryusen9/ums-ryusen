import { BadRequestException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { HEADER_TENANT } from '../../common/config/tenantHeader.config';

interface TenantRequest extends Request {
  tenantId?: string;
}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passReqToCallback: true,
    });
  }

  validate(req: TenantRequest, email: string, password: string): Promise<any> {
    const headerValue =
      req.get?.(HEADER_TENANT.TENANT_ID) ||
      req.headers?.[HEADER_TENANT.TENANT_ID.toLowerCase()];
    const tenantFromHeader = Array.isArray(headerValue)
      ? headerValue[0]
      : headerValue;

    const tenantId = req.tenantId || tenantFromHeader;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID header is required');
    }

    return this.authService.validateUser(tenantId, email, password);
  }
}
