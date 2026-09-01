import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';

// Endpoint'ni faqat ADMIN roli uchun ochish
export const Admin = () =>
  applyDecorators(
    UseGuards(AdminGuard),
    ApiBearerAuth('JWT'),
    ApiUnauthorizedResponse({ description: 'Token yaroqsiz yoki mavjud emas' }),
    ApiForbiddenResponse({ description: 'Admin roli kerak' }),
  );
