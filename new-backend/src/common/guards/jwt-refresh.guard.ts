import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that verifies refresh tokens extracted by the JwtRefreshStrategy.
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') { }
