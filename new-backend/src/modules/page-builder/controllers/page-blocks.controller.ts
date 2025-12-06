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
import { PageBlocksService } from '../services/page-blocks.service';
import { CreateBlockDto } from '../dto/create-block.dto';
import { UpdateBlockDto } from '../dto/update-block.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { BlockInstanceResponseDto, RemovedResponseDto } from 'src/common/swagger/api-models';

@Controller('sites/:siteId/pages/:pageId/blocks')
@ApiTags('Page Blocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PageBlocksController {
    constructor(private readonly pageBlocksService: PageBlocksService) { }

    @Get()
    @SiteAccess(SiteAccessRequirement.MEMBER)
    @UseGuards(SiteAccessGuard)
    @ApiOkResponse({ type: BlockInstanceResponseDto, isArray: true })
    list(@Param('siteId') siteId: string, @Param('pageId') pageId: string) {
        return this.pageBlocksService.list(siteId, pageId);
    }

    @Post()
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiCreatedResponse({ type: BlockInstanceResponseDto })
    create(
        @Param('siteId') siteId: string,
        @Param('pageId') pageId: string,
        @Body() dto: CreateBlockDto,
    ) {
        return this.pageBlocksService.create(siteId, pageId, dto);
    }

    @Patch(':blockId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: BlockInstanceResponseDto })
    update(
        @Param('siteId') siteId: string,
        @Param('pageId') pageId: string,
        @Param('blockId') blockId: string,
        @Body() dto: UpdateBlockDto,
    ) {
        return this.pageBlocksService.update(siteId, pageId, blockId, dto);
    }

    @Delete(':blockId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: RemovedResponseDto })
    remove(
        @Param('siteId') siteId: string,
        @Param('pageId') pageId: string,
        @Param('blockId') blockId: string,
    ) {
        return this.pageBlocksService.remove(siteId, pageId, blockId);
    }
}
