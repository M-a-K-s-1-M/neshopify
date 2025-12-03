import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(ctx: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            ctx.getHandler(),
            ctx.getClass(),
        ]);

        if (!requiredRoles) return true;

        const { user } = ctx.switchToHttp().getRequest();

        if (!user) return false;
        if (!user.roles) return false;

        const ok = requiredRoles.some((role) => user.roles.includes(role));
        if (!ok) throw new ForbiddenException("Недостаточно прав");

        return true;
    }
}