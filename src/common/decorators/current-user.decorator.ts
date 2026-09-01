import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUser {
  userId: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

// Request ichidagi JWT user'ni olish: @CurrentUser() user: JwtUser
export const CurrentUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtUser = request.user;
    return data ? user?.[data] : user;
  },
);
