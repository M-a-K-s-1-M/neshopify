import { Body, Controller, Get, Post, Req, Res, UseGuards, } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { RegistrationUserDto } from './dto/registration-user.dto';
import { LocalGuard } from 'src/common/guards/local.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles-auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Body() dto: RegistrationUserDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.login(dto.email, dto.password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return { accessToken, user };
  }

  @Post('registration')
  async registration(@Body() dto: RegistrationUserDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.ragistration(dto.email, dto.password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return { accessToken, user };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies.refreshToken;
    const token = await this.authService.logout(refreshToken);
    res.clearCookie('refreshToken');
    return token;
  }

  @Get('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const oldRefreshToken = req.cookies.refreshToken;
    const { accessToken, user, refreshToken } = await this.authService.refresh(oldRefreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return { accessToken, user };
  }

  @Post('login-admin')
  async loginAdmin(@Body() dto: RegistrationUserDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.loginAdmin(dto.email, dto.password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return { accessToken, user };
  }

  @Get('profile')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getProfile(@Req() req: Request) {
    return req.user;
  }
}
