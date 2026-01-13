import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional } from 'class-validator';

export class SiteUsersFiltersDto {
    @ApiPropertyOptional({ description: 'Статус пользователя сайта', enum: ['active', 'suspended'] })
    @IsOptional()
    @IsIn(['active', 'suspended'])
    status?: 'active' | 'suspended';

    @ApiPropertyOptional({ description: 'Последняя активность от (ISO или YYYY-MM-DD)' })
    @IsOptional()
    @IsISO8601({ strict: false })
    lastActiveFrom?: string;

    @ApiPropertyOptional({ description: 'Последняя активность до (ISO или YYYY-MM-DD)' })
    @IsOptional()
    @IsISO8601({ strict: false })
    lastActiveTo?: string;
}
