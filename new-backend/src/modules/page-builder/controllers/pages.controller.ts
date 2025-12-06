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

/**
 * Контроллер страниц конструктора сайтов: CRUD операций по страницам.
 */
@Controller()
@ApiTags('Pages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PagesController {
    constructor(private readonly pagesService: PagesService) { }

    /** Создает новую страницу сайта. */
    @Post('sites/:siteId/pages')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiCreatedResponse({ type: PageResponseDto })
    create(@Param('siteId') siteId: string, @Body() dto: CreatePageDto) {
        return this.pagesService.create(siteId, dto);
    }

    /** Возвращает список страниц сайта. */
    @Get('sites/:siteId/pages')
    @SiteAccess(SiteAccessRequirement.MEMBER)
    @UseGuards(SiteAccessGuard)
    @ApiOkResponse({ type: PageResponseDto, isArray: true })
    findAll(@Param('siteId') siteId: string) {
        return this.pagesService.findAll(siteId);
    }

    /** Загружает страницу вместе с блоками. */
    @Get('sites/:siteId/pages/:pageId')
    @SiteAccess(SiteAccessRequirement.MEMBER)
    @UseGuards(SiteAccessGuard)
    @ApiOkResponse({ type: PageResponseDto })
    findOne(@Param('siteId') siteId: string, @Param('pageId') pageId: string) {
        return this.pagesService.findOne(siteId, pageId);
    }

    /** Обновляет метаданные и контент страницы. */
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

    /** Удаляет страницу с сайта. */
    @Delete('sites/:siteId/pages/:pageId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: RemovedResponseDto })
    remove(@Param('siteId') siteId: string, @Param('pageId') pageId: string) {
        return this.pagesService.remove(siteId, pageId);
    }
}
