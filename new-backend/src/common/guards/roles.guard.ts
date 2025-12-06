import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../modules/auth/decorators/roles.decorator';

/**
 * Ensures that the authenticated user contains at least one of the required roles.
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(ctx: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            ctx.getHandler(),
            ctx.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = ctx.switchToHttp().getRequest();

        if (!user?.roles) {
            throw new ForbiddenException('Недостаточно прав');
        }

        const hasRole = requiredRoles.some((role) => user.roles.includes(role));

        if (!hasRole) {
            throw new ForbiddenException('Недостаточно прав');
        }

        return true;
    }
}
