import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles-auth.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
                context.getHandler(),
                context.getClass()
            ])

            if (!requiredRoles) {
                return true;
            }

            const req = context.switchToHttp().getRequest();
            const user = req.user;

            if (!user) {
                throw new UnauthorizedException('Пользователь не найден в запросе');
            }

            const hasAccess = user.userRoles.some(
                (userRole) => requiredRoles.includes(userRole.role.value),
            );

            if (!hasAccess) {
                throw new ForbiddenException('Нет доступа (роль не подходит)');
            }

            return true;

        } catch (e) {
            if (e instanceof UnauthorizedException) {
                throw e;
            }
            throw new ForbiddenException('Нет доступа');
        }
    }
}