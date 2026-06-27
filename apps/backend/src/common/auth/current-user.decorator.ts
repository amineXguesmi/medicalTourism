import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from './request-user.interface';

interface RequestWithUser {
  user?: RequestUser;
}

export const CurrentUser = createParamDecorator(
  (field: keyof RequestUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return field ? user?.[field] : user;
  },
);

