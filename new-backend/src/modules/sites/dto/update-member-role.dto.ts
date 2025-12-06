import { IsEnum } from 'class-validator';
import { SiteMemberRole } from '../../../common/constants/site-member-role';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemberRoleDto {
    @ApiProperty({ enum: SiteMemberRole })
    @IsEnum(SiteMemberRole, { message: 'Недопустимая роль участника' })
    role: SiteMemberRole;
}
