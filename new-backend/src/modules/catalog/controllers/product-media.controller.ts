import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, SiteAccessGuard } from '../../../common/guards';
import { SiteAccess, SiteAccessRequirement } from '../../../common/decorators/site-access.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ProductMediaService } from '../services/product-media.service';
import { CreateProductMediaDto } from '../dto/create-product-media.dto';
import { UpdateProductMediaDto } from '../dto/update-product-media.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProductMediaResponseDto, RemovedResponseDto } from 'src/common/swagger/api-models';

/**
 * Управляет медиа-материалами товара (фото, видео) для конкретного сайта.
 */
@Controller('sites/:siteId/products/:productId/media')
@ApiTags('Product Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProductMediaController {
    constructor(private readonly productMediaService: ProductMediaService) { }

    /** Возвращает отсортированный список медиафайлов товара. */
    @Get()
    @SiteAccess(SiteAccessRequirement.MEMBER)
    @UseGuards(SiteAccessGuard)
    @ApiOkResponse({ type: ProductMediaResponseDto, isArray: true })
    list(@Param('siteId') siteId: string, @Param('productId') productId: string) {
        return this.productMediaService.list(siteId, productId);
    }

    @Post()
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiCreatedResponse({ type: ProductMediaResponseDto })
    create(
        @Param('siteId') siteId: string,
        @Param('productId') productId: string,
        @Body() dto: CreateProductMediaDto,
    ) {
        return this.productMediaService.create(siteId, productId, dto);
    }

    /** Обновляет подписи, порядок или другой метаданные медиа. */
    @Patch(':mediaId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: ProductMediaResponseDto })
    update(
        @Param('siteId') siteId: string,
        @Param('productId') productId: string,
        @Param('mediaId') mediaId: string,
        @Body() dto: UpdateProductMediaDto,
    ) {
        return this.productMediaService.update(siteId, productId, mediaId, dto);
    }

    /** Удаляет медиафайл и нормализует порядок оставшихся. */
    @Delete(':mediaId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: RemovedResponseDto })
    remove(
        @Param('siteId') siteId: string,
        @Param('productId') productId: string,
        @Param('mediaId') mediaId: string,
    ) {
        return this.productMediaService.remove(siteId, productId, mediaId);
    }
}
