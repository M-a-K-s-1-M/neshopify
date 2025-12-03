import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards, } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { RegistrationUserDto } from './dto/registration-user.dto';
import { LocalGuard } from 'src/common/guards/local.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles-auth.decorator';
import { RefreshJwtGuard } from 'src/common/guards/refresh-jwt.guard';
import { TokenService } from '../tokens/token.service';
import { Cookies } from 'src/common/decorators/cookies.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly tokenService: TokenService
  ) { }


  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Body() dto: RegistrationUserDto, @Res() res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.login(dto.email, dto.password);


    await this.tokenService.setRefreshTokenToCookie(refreshToken, res);

    return res.json({ accessToken, user });
  }

  @Post('registration')
  async registration(@Body() dto: RegistrationUserDto, @Res() res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.ragistration(dto.email, dto.password);

    await this.tokenService.setRefreshTokenToCookie(refreshToken, res);

    return res.json({ accessToken, user });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.refreshToken;
    const token = await this.authService.logout(refreshToken);

    res.clearCookie('refreshToken');

    return res.json(token);
  }

  @Get('refresh')
  async refresh(@Cookies() oldRefreshToken: string, @Res() res: Response) {
    if (!oldRefreshToken) {
      throw new UnauthorizedException();
    }

    const { accessToken, user, refreshToken } = await this.authService.refresh(oldRefreshToken);

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException();
    }

    await this.tokenService.setRefreshTokenToCookie(refreshToken, res);

    return res.json({ accessToken, user });
  }

  @Post('login-admin')
  async loginAdmin(@Body() dto: RegistrationUserDto, @Res() res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.loginAdmin(dto.email, dto.password);

    await this.tokenService.setRefreshTokenToCookie(refreshToken, res);

    return res.json({ accessToken, user });
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    return req.user;
  }
}
