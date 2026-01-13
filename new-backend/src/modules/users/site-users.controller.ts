import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, SiteAccessGuard } from 'src/common/guards';
import { PaginationPipe } from 'src/common/pipes';
import type { PaginationQuery } from 'src/common/pipes';
import { ApiPaginatedResponse } from 'src/common/swagger/api-paginated-response.decorator';
import { SiteUserResponseDto } from 'src/common/swagger/api-models';
import { SiteAccess, SiteAccessRequirement } from 'src/common/decorators/site-access.decorator';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { SiteUsersFiltersDto } from './dto/site-users-filters.dto';
import { SiteUsersService } from './site-users.service';

/**
 * Закрытый контроллер списка пользователей (CUSTOMER) конкретного сайта.
 */
@Controller('sites/:siteId/users')
@ApiTags('Site Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SiteUsersController {
    constructor(private readonly siteUsersService: SiteUsersService) { }

    @Get()
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiPaginatedResponse(SiteUserResponseDto)
    list(
        @Param('siteId') siteId: string,
        @Query(new PaginationPipe({ defaultLimit: 20, maxLimit: 100 })) pagination: PaginationQuery,
        @Query() filters: SiteUsersFiltersDto,
    ) {
        return this.siteUsersService.list(siteId, pagination, filters);
    }
}
