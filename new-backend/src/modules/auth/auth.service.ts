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

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService
    ) { }

    // Генерация двух токенов
    generateTokens(payload: JwtPayload) {
        const accessToken = this.jwt.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: "15s", // "15m"
        });

        const refreshToken = this.jwt.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: "30d", // "30d"
        });

        return { accessToken, refreshToken };
    }

    // -------------------------------------
    // REGISTRATION OF SITE OWNER
    // -------------------------------------
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

    // -------------------------------------
    // REGISTRATION OF CUSTOMER
    // -------------------------------------
    async registerCustomer(dto: RegisterDto, siteId: string) {
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

    // -------------------------------------
    // LOGIN FOR ALL ROLES
    // -------------------------------------
    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { userRoles: { include: { role: true } } },
            omit: { passwordHash: false }
        });

        if (!user) throw new UnauthorizedException("Пользователь не найден");

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

    async loginAdmin(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { userRoles: { include: { role: true } } },
            omit: { passwordHash: false }
        });

        if (!user) throw new UnauthorizedException("Пользователь не найден");

        const ok = await bcrypt.compare(dto.password, user.passwordHash);

        if (!ok) throw new UnauthorizedException("Неверная почта или пароль");

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

    // -------------------------------------
    // REFRESH TOKENS (ROTATING)
    // -------------------------------------
    async refresh(payload: JwtPayload) {
        delete payload.iat;
        delete payload.exp;

        return this.generateTokens(payload);
    }
}