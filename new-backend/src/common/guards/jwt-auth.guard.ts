import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guards endpoints that require a valid access token stored in cookies or headers.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
