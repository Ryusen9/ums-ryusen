import { BadRequestException, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { HEADER_TENANT } from '../config/tenantHeader.config';

interface TenantRequest extends Request {
  tenantId?: string;
}

export class TenantIdMiddleware implements NestMiddleware {
  use(req: TenantRequest, _res: Response, next: NextFunction) {
    if (req.tenantId && typeof req.tenantId === 'string') {
      return next();
    }

    const headerValue =
      req.get?.(HEADER_TENANT.TENANT_ID) ||
      req.headers?.[HEADER_TENANT.TENANT_ID.toLowerCase()];

    const header = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (!header) {
      throw new BadRequestException(
        `Header ${HEADER_TENANT.TENANT_ID} is required`,
      );
    }
    req.tenantId = header;
    next();
  }
}
