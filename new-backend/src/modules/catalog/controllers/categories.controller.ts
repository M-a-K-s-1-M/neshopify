import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, SiteAccessGuard } from '../../../common/guards';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SiteAccess, SiteAccessRequirement } from '../../../common/decorators/site-access.decorator';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProductCategoryResponseDto, RemovedResponseDto } from 'src/common/swagger/api-models';

@Controller('sites/:siteId/categories')
@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    @SiteAccess(SiteAccessRequirement.MEMBER)
    @UseGuards(SiteAccessGuard)
    @ApiOkResponse({ type: ProductCategoryResponseDto, isArray: true })
    list(@Param('siteId') siteId: string) {
        return this.categoriesService.list(siteId);
    }

    @Get(':categoryId')
    @SiteAccess(SiteAccessRequirement.MEMBER)
    @UseGuards(SiteAccessGuard)
    @ApiOkResponse({ type: ProductCategoryResponseDto })
    get(@Param('siteId') siteId: string, @Param('categoryId') categoryId: string) {
        return this.categoriesService.get(siteId, categoryId);
    }

    @Post()
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiCreatedResponse({ type: ProductCategoryResponseDto })
    create(@Param('siteId') siteId: string, @Body() dto: CreateCategoryDto) {
        return this.categoriesService.create(siteId, dto);
    }

    @Patch(':categoryId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: ProductCategoryResponseDto })
    update(
        @Param('siteId') siteId: string,
        @Param('categoryId') categoryId: string,
        @Body() dto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(siteId, categoryId, dto);
    }

    @Delete(':categoryId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: RemovedResponseDto })
    remove(@Param('siteId') siteId: string, @Param('categoryId') categoryId: string) {
        return this.categoriesService.remove(siteId, categoryId);
    }
}
