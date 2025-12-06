import { Module } from '@nestjs/common';
import { CategoriesController } from './controllers/categories.controller';
import { ProductsController } from './controllers/products.controller';
import { ProductMediaController } from './controllers/product-media.controller';
import { CategoriesService } from './services/categories.service';
import { ProductsService } from './services/products.service';
import { ProductMediaService } from './services/product-media.service';
import { SiteAccessGuard } from '../../common/guards';

@Module({
    controllers: [CategoriesController, ProductsController, ProductMediaController],
    providers: [CategoriesService, ProductsService, ProductMediaService, SiteAccessGuard],
})
export class CatalogModule { }
