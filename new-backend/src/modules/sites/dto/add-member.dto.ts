import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { SiteMemberRole } from '../../../common/constants/site-member-role';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddMemberDto {
    @ApiProperty({ example: 'editor@site.com' })
    @IsEmail({}, { message: 'Некорректный формат email' })
    email: string;

    @ApiPropertyOptional({ enum: SiteMemberRole, default: SiteMemberRole.EDITOR })
    @IsOptional()
    @IsEnum(SiteMemberRole, { message: 'Недопустимая роль участника' })
    role?: SiteMemberRole;
}
