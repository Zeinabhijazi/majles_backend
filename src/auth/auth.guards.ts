import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/auth/roles.decorator';
import { UserContextService } from '@/singleton/user-context.service';
import { UserType } from '@generated/index';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(UserContextService)
    private readonly userContext: UserContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get<UserType[]>(
      ROLES_KEY,
      context.getHandler()
    );
    
    if (!requiredRoles) return true; // if no @Roles decorator*/

    const user = this.userContext.user; // fetch current user from singleton

    if (!user) {
      throw new UnauthorizedException('User not found in context');
    }

    if (!requiredRoles.includes(user.userType)) {
      throw new UnauthorizedException(
        `User with role "${user.userType}" not allowed to access this resource`,
      );
    }

    return true;
  }
}
