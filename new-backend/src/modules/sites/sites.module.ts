import { Module } from '@nestjs/common';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { SiteAccessGuard } from '../../common/guards';

@Module({
    controllers: [SitesController],
    providers: [SitesService, SiteAccessGuard],
    exports: [SitesService],
})
export class SitesModule { }
