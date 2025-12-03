import { Body, Controller, HttpException, HttpStatus, Post, Res } from "@nestjs/common";
import { TokenService } from "./token.service";
import type { Response } from "express";

@Controller('tokens')
export class TokenController {
    constructor(private tokenService: TokenService) { }

    @Post('validate-access')
    async validateAccessToken(@Body('accessToken') accessToken: string, @Res() res: Response) {
        const payload = await this.tokenService.validateAccessToken(accessToken);
        if (!payload) throw new HttpException("Токен на валидный", HttpStatus.BAD_REQUEST);

        return res.json(payload);
    }
}