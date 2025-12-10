import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  Get,
  Param,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard, JwtRefreshGuard, RolesGuard } from "../../common/guards";
import { Roles } from "./decorators/roles.decorator";
import type { Request, Response } from "express";
import { JwtPayload } from "./interfaces/jwt-payload";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AccessTokenResponseDto, JwtPayloadResponseDto, MessageResponseDto, OkResponseDto } from "src/common/swagger/api-models";

/**
 * Контроллер аутентификации: регистрация, логин, обновление токенов и проверки ролей.
 */
@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private auth: AuthService) { }

  private readonly isProd = process.env.NODE_ENV === "production";

  /** Регистрация владельца сайта (создает пользователя и выдает токены). */
  @Post("register")
  @ApiCreatedResponse({ type: AccessTokenResponseDto })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.register(dto);

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      sameSite: this.isProd ? "none" : "lax", // или 'none' + secure только в проде
      secure: this.isProd,
      path: "/",
      maxAge: 1000 * 60 * 15,
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: this.isProd ? "none" : "lax",
      secure: this.isProd,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return { accessToken: tokens.accessToken };
  }

  /** Регистрация клиента конкретного сайта. */
  @Post("register-customer/:siteId")
  @ApiCreatedResponse({ type: AccessTokenResponseDto })
  async registerCustomer(
    @Body() dto: RegisterDto,
    @Param("siteId") siteId: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.auth.registerCustomer(dto, siteId);

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      sameSite: this.isProd ? "none" : "lax", // или 'none' + secure только в проде
      secure: this.isProd,
      path: "/",
      maxAge: 1000 * 60 * 15,
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: this.isProd ? "none" : "lax",
      secure: this.isProd,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });


    return { accessToken: tokens.accessToken };
  }

  /** Универсальный логин (любой роли) по email/паролю. */
  @Post("login")
  @ApiOkResponse({ type: AccessTokenResponseDto })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.login(dto);

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      sameSite: this.isProd ? "none" : "lax", // или 'none' + secure только в проде
      secure: this.isProd,
      path: "/",
      maxAge: 1000 * 60 * 15,
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: this.isProd ? "none" : "lax",
      secure: this.isProd,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return { accessToken: tokens.accessToken };
  }

  /** Логин администратора с дополнительной проверкой роли. */
  @Post("login-admin")
  @ApiOkResponse({ type: AccessTokenResponseDto })
  async loginAdmin(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.loginAdmin(dto);

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      sameSite: this.isProd ? "none" : "lax", // или 'none' + secure только в проде
      secure: this.isProd,
      path: "/",
      maxAge: 1000 * 60 * 15,
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: this.isProd ? "none" : "lax",
      secure: this.isProd,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return { accessToken: tokens.accessToken };
  }

  /** Обновление пары токенов по refresh-cookie. */
  @Post("refresh")
  @UseGuards(JwtRefreshGuard)
  @ApiOkResponse({ type: AccessTokenResponseDto })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    if (!user) throw new Error("No user in request");
    const tokens = await this.auth.refresh(user as JwtPayload);

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      sameSite: this.isProd ? "none" : "lax", // или 'none' + secure только в проде
      secure: this.isProd,
      path: "/",
      maxAge: 1000 * 60 * 15,
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: this.isProd ? "none" : "lax",
      secure: this.isProd,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });


    return { accessToken: tokens.accessToken };
  }

  /** Выход — очищает cookies с токенами. */
  @Post("logout")
  @ApiOkResponse({ type: MessageResponseDto })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return { message: "ok" };
  }

  /** Возвращает текущего пользователя из access-токена. */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: JwtPayloadResponseDto })
  @Get("me")
  async me(@Req() req: Request) {
    const user = req.user as JwtPayload | undefined;

    if (!user) {
      throw new UnauthorizedException("Пользователь не найден");
    }

    return this.auth.getCurrentUser(user.sub);
  }

  /** Проверка доступа администратора (health-check для панели). */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOkResponse({ type: OkResponseDto })
  @Get("admin-check")
  adminCheck() {
    return { ok: true };
  }

  /** Проверка роли владельца сайта. */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SITE_OWNER")
  @ApiBearerAuth()
  @ApiOkResponse({ type: OkResponseDto })
  @Get("owner-check")
  ownerCheck() {
    return { ok: true };
  }

  /** Проверка роли покупателя. */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CUSTOMER")
  @ApiBearerAuth()
  @ApiOkResponse({ type: OkResponseDto })
  @Get("customer-check")
  customerCheck() {
    return { ok: true };
  }
}