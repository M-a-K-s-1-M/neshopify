import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, SiteAccessGuard } from 'src/common/guards';
import { SiteAccess, SiteAccessRequirement } from 'src/common/decorators/site-access.decorator';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { AnalyticsService } from '../services/analytics.service';
import { SiteAnalyticsSummaryResponseDto } from '../dto/site-analytics-summary.dto';
import { SiteRegistrationsResponseDto } from '../dto/site-registrations.dto';
import { SiteOrdersSeriesResponseDto } from '../dto/site-orders-series.dto';

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

    @Get('registrations')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: SiteRegistrationsResponseDto })
    registrations(@Param('siteId') siteId: string, @Query('months') months?: string) {
        return this.analyticsService.getSiteRegistrationsSeries(siteId, months ? Number(months) : 12);
    }

    @Get('orders')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: SiteOrdersSeriesResponseDto })
    orders(@Param('siteId') siteId: string, @Query('months') months?: string) {
        return this.analyticsService.getSiteOrdersSeries(siteId, months ? Number(months) : 12);
    }
}
