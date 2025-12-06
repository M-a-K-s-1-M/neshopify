import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, SiteAccessGuard } from '../../../common/guards';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SiteAccess, SiteAccessRequirement } from '../../../common/decorators/site-access.decorator';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductFiltersDto } from '../dto/product-filters.dto';
import { PaginationPipe } from '../../../common/pipes';
import type { PaginationQuery } from '../../../common/pipes';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProductResponseDto, RemovedResponseDto } from 'src/common/swagger/api-models';
import { ApiPaginatedResponse } from 'src/common/swagger/api-paginated-response.decorator';

@Controller('sites/:siteId/products')
@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    @SiteAccess(SiteAccessRequirement.MEMBER)
    @UseGuards(SiteAccessGuard)
    @ApiPaginatedResponse(ProductResponseDto)
    list(
        @Param('siteId') siteId: string,
        @Query(new PaginationPipe({ defaultLimit: 20, maxLimit: 100 })) pagination: PaginationQuery,
        @Query() filters: ProductFiltersDto,
    ) {
        return this.productsService.list(siteId, filters, pagination);
    }

    @Get(':productId')
    @SiteAccess(SiteAccessRequirement.MEMBER)
    @UseGuards(SiteAccessGuard)
    @ApiOkResponse({ type: ProductResponseDto })
    get(@Param('siteId') siteId: string, @Param('productId') productId: string) {
        return this.productsService.get(siteId, productId);
    }

    @Post()
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiCreatedResponse({ type: ProductResponseDto })
    create(@Param('siteId') siteId: string, @Body() dto: CreateProductDto) {
        return this.productsService.create(siteId, dto);
    }

    @Patch(':productId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: ProductResponseDto })
    update(
        @Param('siteId') siteId: string,
        @Param('productId') productId: string,
        @Body() dto: UpdateProductDto,
    ) {
        return this.productsService.update(siteId, productId, dto);
    }

    @Delete(':productId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: RemovedResponseDto })
    remove(@Param('siteId') siteId: string, @Param('productId') productId: string) {
        return this.productsService.remove(siteId, productId);
    }
}
