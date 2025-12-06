import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, SiteAccessGuard } from '../../../common/guards';
import { SiteAccess, SiteAccessRequirement } from '../../../common/decorators/site-access.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PagesService } from '../services/pages.service';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PageResponseDto, RemovedResponseDto } from 'src/common/swagger/api-models';

@Controller()
@ApiTags('Pages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PagesController {
    constructor(private readonly pagesService: PagesService) { }

    @Post('sites/:siteId/pages')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiCreatedResponse({ type: PageResponseDto })
    create(@Param('siteId') siteId: string, @Body() dto: CreatePageDto) {
        return this.pagesService.create(siteId, dto);
    }

    @Get('sites/:siteId/pages')
    @SiteAccess(SiteAccessRequirement.MEMBER)
    @UseGuards(SiteAccessGuard)
    @ApiOkResponse({ type: PageResponseDto, isArray: true })
    findAll(@Param('siteId') siteId: string) {
        return this.pagesService.findAll(siteId);
    }

    @Get('sites/:siteId/pages/:pageId')
    @SiteAccess(SiteAccessRequirement.MEMBER)
    @UseGuards(SiteAccessGuard)
    @ApiOkResponse({ type: PageResponseDto })
    findOne(@Param('siteId') siteId: string, @Param('pageId') pageId: string) {
        return this.pagesService.findOne(siteId, pageId);
    }

    @Patch('sites/:siteId/pages/:pageId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: PageResponseDto })
    update(
        @Param('siteId') siteId: string,
        @Param('pageId') pageId: string,
        @Body() dto: UpdatePageDto,
    ) {
        return this.pagesService.update(siteId, pageId, dto);
    }

    @Delete('sites/:siteId/pages/:pageId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: RemovedResponseDto })
    remove(@Param('siteId') siteId: string, @Param('pageId') pageId: string) {
        return this.pagesService.remove(siteId, pageId);
    }
}
