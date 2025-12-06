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
import { BlockCommentsService } from '../services/block-comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CommentResponseDto, RemovedResponseDto } from 'src/common/swagger/api-models';

/**
 * Позволяет управлять комментариями внутри блоков страницы.
 */
@Controller('sites/:siteId/pages/:pageId/blocks/:blockId/comments')
@ApiTags('Block Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BlockCommentsController {
    constructor(private readonly blockCommentsService: BlockCommentsService) { }

    /** Возвращает список комментариев блока. */
    @Get()
    @SiteAccess(SiteAccessRequirement.MEMBER)
    @UseGuards(SiteAccessGuard)
    @ApiOkResponse({ type: CommentResponseDto, isArray: true })
    list(
        @Param('siteId') siteId: string,
        @Param('pageId') pageId: string,
        @Param('blockId') blockId: string,
    ) {
        return this.blockCommentsService.list(siteId, pageId, blockId);
    }

    /** Создает новый комментарий (шаблонный или произвольный). */
    @Post()
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.MEMBER)
    @ApiCreatedResponse({ type: CommentResponseDto })
    @UseGuards(RolesGuard, SiteAccessGuard)
    create(
        @Param('siteId') siteId: string,
        @Param('pageId') pageId: string,
        @Param('blockId') blockId: string,
        @Body() dto: CreateCommentDto,
    ) {
        return this.blockCommentsService.create(siteId, pageId, blockId, dto);
    }

    /** Обновляет содержимое комментария. */
    @Patch(':commentId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.MEMBER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: CommentResponseDto })
    update(
        @Param('siteId') siteId: string,
        @Param('pageId') pageId: string,
        @Param('blockId') blockId: string,
        @Param('commentId') commentId: string,
        @Body() dto: UpdateCommentDto,
    ) {
        return this.blockCommentsService.update(siteId, pageId, blockId, commentId, dto);
    }

    /** Удаляет комментарий. */
    @Delete(':commentId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.MEMBER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: RemovedResponseDto })
    remove(
        @Param('siteId') siteId: string,
        @Param('pageId') pageId: string,
        @Param('blockId') blockId: string,
        @Param('commentId') commentId: string,
    ) {
        return this.blockCommentsService.remove(siteId, pageId, blockId, commentId);
    }
}
