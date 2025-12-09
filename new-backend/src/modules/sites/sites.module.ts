import { Module } from '@nestjs/common';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { SiteAccessGuard } from '../../common/guards';
import { PageBuilderModule } from '../page-builder/page-builder.module';

@Module({
    imports: [PageBuilderModule],
    controllers: [SitesController],
    providers: [SitesService, SiteAccessGuard],
    exports: [SitesService],
})
export class SitesModule { }
