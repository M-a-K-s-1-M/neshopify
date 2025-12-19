import { Module } from '@nestjs/common';
import { PagesController } from './controllers/pages.controller';
import { PageBlocksController } from './controllers/page-blocks.controller';
import { BlockTemplatesController } from './controllers/block-templates.controller';
import { CommentTemplatesController } from './controllers/comment-templates.controller';
import { BlockCommentsController } from './controllers/block-comments.controller';
import { StorefrontController } from './controllers/storefront.controller';
import { PagesService } from './services/pages.service';
import { PageBlocksService } from './services/page-blocks.service';
import { BlockTemplatesService } from './services/block-templates.service';
import { CommentTemplatesService } from './services/comment-templates.service';
import { BlockCommentsService } from './services/block-comments.service';
import { BlockSchemaRegistry } from './schemas/block-schema.registry';
import { SiteAccessGuard } from '../../common/guards';
import { SiteStructureService } from './services/site-structure.service';

@Module({
    controllers: [
        PagesController,
        PageBlocksController,
        BlockTemplatesController,
        CommentTemplatesController,
        BlockCommentsController,
        StorefrontController,
    ],
    providers: [
        PagesService,
        PageBlocksService,
        BlockTemplatesService,
        CommentTemplatesService,
        BlockCommentsService,
        BlockSchemaRegistry,
        SiteStructureService,
        SiteAccessGuard,
    ],
    exports: [
        PagesService,
        PageBlocksService,
        BlockTemplatesService,
        CommentTemplatesService,
        BlockCommentsService,
        SiteStructureService,
    ],
})
export class PageBuilderModule { }
