import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  Get,
  Param,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { Roles } from "./decorators/roles.decorator";
import type { Request, Response } from "express";
import { JwtPayload } from "./interfaces/jwt-payload";
import { AuthGuard } from "@nestjs/passport";

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) { }

  // SITE OWNER
  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.register(dto);

    res.cookie("accessToken", tokens.accessToken);
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      // path: "/auth/refresh",
    });

    return { accessToken: tokens.accessToken };
  }

  // CUSTOMER
  @Post("register-customer/:siteId")
  async registerCustomer(
    @Body() dto: RegisterDto,
    @Param("siteId") siteId: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.auth.registerCustomer(dto, siteId);

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: false,
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      // path: "/auth/refresh",
    });

    return { accessToken: tokens.accessToken };
  }

  // LOGIN
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.login(dto);

    res.cookie("accessToken", tokens.accessToken);
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      // path: "/auth/refresh",
    });

    return { accessToken: tokens.accessToken };
  }

  @Post("login-admin")
  async loginAdmin(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.loginAdmin(dto);

    res.cookie("accessToken", tokens.accessToken);
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      // path: "/auth/refresh",
    });

    return { accessToken: tokens.accessToken };
  }

  // REFRESH TOKEN
  @Post("refresh")
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    if (!user) throw new Error("No user in request");
    const tokens = await this.auth.refresh(user as JwtPayload);

    res.cookie("accessToken", tokens.accessToken);
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      // path: "/auth/refresh",
    });

    return { accessToken: tokens.accessToken };
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken", { path: "/auth/refresh" });
    return { message: "ok" };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Get("admin-check")
  adminCheck() {
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SITE_OWNER")
  @Get("owner-check")
  ownerCheck() {
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CUSTOMER")
  @Get("customer-check")
  customerCheck() {
    return { ok: true };
  }
}