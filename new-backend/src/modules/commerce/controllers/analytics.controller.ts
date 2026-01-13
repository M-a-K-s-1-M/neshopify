import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, SiteAccessGuard } from 'src/common/guards';
import { SiteAccess, SiteAccessRequirement } from 'src/common/decorators/site-access.decorator';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { AnalyticsService } from '../services/analytics.service';
import { SiteAnalyticsSummaryResponseDto } from '../dto/site-analytics-summary.dto';

/**
 * Сводная аналитика по сайту для владельца.
 */
@Controller('sites/:siteId/analytics')
@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('summary')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: SiteAnalyticsSummaryResponseDto })
    summary(@Param('siteId') siteId: string) {
        return this.analyticsService.getSiteSummary(siteId);
    }
}
