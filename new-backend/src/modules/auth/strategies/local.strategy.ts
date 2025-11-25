import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authServic: AuthService) {
        super();
    }

    validate(email: string, password: string): any {
        // const user = this.authServic.validateUser({ email, password });
        // if (!user) throw new UnauthorizedException();
        // return user;
    }
}