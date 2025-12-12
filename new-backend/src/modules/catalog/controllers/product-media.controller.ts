import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { JwtAuthGuard, RolesGuard, SiteAccessGuard } from '../../../common/guards';
import { SiteAccess, SiteAccessRequirement } from '../../../common/decorators/site-access.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ProductMediaService } from '../services/product-media.service';
import { CreateProductMediaDto } from '../dto/create-product-media.dto';
import { UpdateProductMediaDto } from '../dto/update-product-media.dto';
import { ApiBearerAuth, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
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

    /** Загружает сразу несколько изображений и создаёт записи ProductMedia. */
    @Post('upload')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiConsumes('multipart/form-data')
    @ApiCreatedResponse({ type: ProductMediaResponseDto, isArray: true })
    @UseInterceptors(
        FilesInterceptor('files', 20, {
            limits: { fileSize: 10 * 1024 * 1024 },
            fileFilter: (_req, file, cb) => {
                if (file.mimetype?.startsWith('image/')) {
                    cb(null, true);
                    return;
                }
                cb(null, false);
            },
            storage: diskStorage({
                destination: (req, _file, cb) => {
                    const productId = (req as any)?.params?.productId as string;
                    const dest = join(process.cwd(), 'uploads', 'products', productId);
                    mkdirSync(dest, { recursive: true });
                    cb(null, dest);
                },
                filename: (_req, file, cb) => {
                    const safeExt = extname(file.originalname) || '';
                    cb(null, `${randomUUID()}${safeExt}`);
                },
            }),
        }),
    )
    async upload(
        @Param('siteId') siteId: string,
        @Param('productId') productId: string,
        @UploadedFiles()
        files: Array<{ filename: string; originalname: string }>,
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('Не удалось загрузить файлы. Проверьте формат (только изображения) и размер.');
        }

        const items = (files ?? []).map((file) => ({
            url: `/uploads/products/${productId}/${file.filename}`,
            alt: file.originalname,
        }));

        return this.productMediaService.createMany(siteId, productId, items);
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
