import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtPayload } from "./interfaces/jwt-payload";
import { ConfigService } from "@nestjs/config";
import type { StringValue } from "ms";

/**
 * Сервис аутентификации: создает учетные записи, логинит пользователей и выдает JWT.
 */
@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private readonly configService: ConfigService,
    ) { }

    /** Генерирует пару access/refresh токенов для заданного payload. */
    generateTokens(payload: JwtPayload) {
        const accessSecret = this.configService.getOrThrow<string>('jwt.accessSecret');
        const refreshSecret = this.configService.getOrThrow<string>('jwt.refreshSecret');
        const accessTtl: StringValue = this.configService.get<StringValue>('jwt.accessTtl') ?? '15m';
        const refreshTtl: StringValue = this.configService.get<StringValue>('jwt.refreshTtl') ?? '30d';

        const accessToken = this.jwt.sign(payload, {
            secret: accessSecret,
            expiresIn: accessTtl,
        });

        const refreshToken = this.jwt.sign(payload, {
            secret: refreshSecret,
            expiresIn: refreshTtl,
        });

        return { accessToken, refreshToken };
    }

    /** Регистрирует владельца сайта и назначает роль SITE_OWNER. */
    async register(dto: RegisterDto) {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (exists) throw new BadRequestException("Email уже используется");

        const hash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: hash,
                userRoles: {
                    create: {
                        role: { connect: { value: "SITE_OWNER" } },
                    },
                },
            },
            include: { userRoles: { include: { role: true } } },
        });

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            roles: user.userRoles.map((r) => r.role.value),
        };

        return this.generateTokens(payload);
    }

    /** Регистрирует покупателя конкретного сайта и выдаёт роль CUSTOMER. */
    async registerCustomer(dto: RegisterDto, siteId: string) {
        if (!siteId) {
            // Для привязки клиента нам нужен конкретный сайт
            throw new BadRequestException("siteId обязателен");
        }

        // Одним транзакционным запросом проверяем наличие сайта и дубликата email
        const [site, existingUser] = await this.prisma.$transaction([
            this.prisma.site.findUnique({ where: { id: siteId } }),
            this.prisma.user.findUnique({ where: { email: dto.email } }),
        ]);

        if (!site) {
            throw new BadRequestException("Сайт не найден");
        }

        if (existingUser) {
            throw new BadRequestException("Email уже используется");
        }

        const hash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: hash,
                siteId,
                userRoles: {
                    create: {
                        role: { connect: { value: "CUSTOMER" } },
                    },
                },
            },
            include: { userRoles: { include: { role: true } } },
        });

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            roles: ["CUSTOMER"],
            siteId,
        };

        return this.generateTokens(payload);
    }

    /** Логин для любых ролей: проверка пароля, блокировок и выдача токенов. */
    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { userRoles: { include: { role: true } } },
            omit: { passwordHash: false }
        });

        if (!user) throw new UnauthorizedException("Пользователь не найден");
        if (user.banned) throw new UnauthorizedException("Пользователь заблокирован"); // Запрещаем логин забаненным

        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok) throw new UnauthorizedException("Неверная почта или пароль");

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            roles: user.userRoles.map((r) => r.role.value),
            siteId: user.siteId || undefined,
        };

        return this.generateTokens(payload);
    }

    /** Логин администратора с обязательной проверкой роли ADMIN. */
    async loginAdmin(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { userRoles: { include: { role: true } } },
            omit: { passwordHash: false }
        });

        if (!user) throw new UnauthorizedException("Пользователь не найден");

        const ok = await bcrypt.compare(dto.password, user.passwordHash);

        if (!ok) throw new UnauthorizedException("Неверная почта или пароль");

        if (user.banned) throw new UnauthorizedException("Пользователь заблокирован"); // Админка также недоступна заблокированным

        const isAdmin = user.userRoles.some(r => r.role.value === 'ADMIN');

        if (!isAdmin) throw new UnauthorizedException("У вас нет доступа к админ панели");

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            roles: user.userRoles.map((r) => r.role.value),
            siteId: user.siteId || undefined,
        };

        return this.generateTokens(payload);

    }

    /** Выпускает новую пару токенов по refresh-токену (rotating схема). */
    async refresh(payload: JwtPayload) {
        delete payload.iat;
        delete payload.exp;

        return this.generateTokens(payload);
    }
}