import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    BlockCategory,
    CommentTone,
    OrderStatus,
    PageType,
    PaymentStatus,
    SiteStatus,
    StockStatus,
} from '../../../generated/prisma/client';
import { SiteMemberRole } from 'src/common/constants/site-member-role';

export class PaginationMetaDto {
    @ApiProperty({ example: 125 })
    total: number;

    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 20 })
    limit: number;
}

export class AccessTokenResponseDto {
    @ApiProperty({ description: 'JWT access token' })
    accessToken: string;
}

export class MessageResponseDto {
    @ApiProperty({ example: 'ok' })
    message: string;
}

export class OkResponseDto {
    @ApiProperty({ example: true })
    ok: boolean;
}

export class RemovedResponseDto {
    @ApiProperty({ example: true })
    removed: boolean;
}

export class ReceivedResponseDto {
    @ApiProperty({ example: true })
    received: boolean;
}

export class SchemaEntryDto {
    @ApiProperty()
    key: string;

    @ApiProperty({ description: 'Группа или категория, в которой отображается шаблон' })
    category: string;

    @ApiProperty({ type: Object })
    schema: Record<string, any>;
}

export class JwtPayloadResponseDto {
    @ApiProperty({ description: 'Идентификатор пользователя', format: 'uuid' })
    sub: string;

    @ApiProperty()
    email: string;

    @ApiProperty({ type: [String] })
    roles: string[];

    @ApiPropertyOptional({ description: 'Связанный сайт для CUSTOMER', format: 'uuid' })
    siteId?: string;
}

export class RoleSummaryDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty()
    value: string;

    @ApiPropertyOptional()
    description?: string | null;
}

export class UserSummaryDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty()
    email: string;
}

export class RoleUserAssignmentDto {
    @ApiProperty({ format: 'uuid' })
    userId: string;

    @ApiProperty({ format: 'uuid' })
    roleId: string;

    @ApiProperty({ type: () => UserSummaryDto })
    user?: UserSummaryDto;
}

export class RoleResponseDto extends RoleSummaryDto {
    @ApiPropertyOptional({ type: () => [RoleUserAssignmentDto] })
    userRoles?: RoleUserAssignmentDto[];
}

export class UserRoleResponseDto {
    @ApiProperty({ format: 'uuid' })
    roleId: string;

    @ApiProperty({ type: () => RoleSummaryDto })
    role: RoleSummaryDto;
}

export class UserResponseDto extends UserSummaryDto {
    @ApiProperty({ type: Boolean })
    banned: boolean;

    @ApiProperty({ type: () => [UserRoleResponseDto] })
    userRoles: UserRoleResponseDto[];

    @ApiPropertyOptional({ format: 'uuid' })
    siteId?: string | null;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: string;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt: string;
}

export class SiteMemberResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ format: 'uuid' })
    siteId: string;

    @ApiProperty({ format: 'uuid' })
    userId: string;

    @ApiProperty({ enum: SiteMemberRole, enumName: 'SiteMemberRole' })
    role: SiteMemberRole;

    @ApiProperty({ type: () => UserSummaryDto })
    user: UserSummaryDto;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: string;
}

export class SiteResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    slug: string;

    @ApiPropertyOptional()
    domain?: string | null;

    @ApiProperty({ enum: SiteStatus, enumName: 'SiteStatus' })
    status: SiteStatus;

    @ApiProperty({ format: 'uuid' })
    ownerId: string;

    @ApiPropertyOptional({ type: Object })
    theme?: Record<string, any> | null;

    @ApiPropertyOptional({ type: Object })
    seo?: Record<string, any> | null;

    @ApiPropertyOptional({ type: String, format: 'date-time' })
    publishedAt?: string | null;

    @ApiPropertyOptional()
    plan?: string | null;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: string;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt: string;

    @ApiPropertyOptional({ type: () => [SiteMemberResponseDto] })
    members?: SiteMemberResponseDto[];
}

export class CommentTemplateResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    body: string;

    @ApiPropertyOptional()
    avatarUrl?: string | null;

    @ApiPropertyOptional()
    authorName?: string | null;

    @ApiProperty({ default: 5 })
    rating: number;

    @ApiProperty({ enum: CommentTone, enumName: 'CommentTone' })
    tone: CommentTone;

    @ApiProperty()
    locale: string;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: string;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt: string;
}

export class CommentResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ format: 'uuid' })
    blockId: string;

    @ApiPropertyOptional({ format: 'uuid' })
    templateId?: string | null;

    @ApiProperty()
    authorName: string;

    @ApiPropertyOptional()
    avatarUrl?: string | null;

    @ApiProperty()
    body: string;

    @ApiProperty({ default: 5 })
    rating: number;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: string;
}

export class BlockTemplateResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty()
    key: string;

    @ApiProperty()
    title: string;

    @ApiPropertyOptional()
    description?: string | null;

    @ApiProperty({ enum: BlockCategory, enumName: 'BlockCategory' })
    category: BlockCategory;

    @ApiProperty({ type: Object })
    schema: Record<string, any>;

    @ApiPropertyOptional()
    previewUrl?: string | null;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: string;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt: string;
}

export class BlockInstanceResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ format: 'uuid' })
    pageId: string;

    @ApiProperty({ format: 'uuid' })
    templateId: string;

    @ApiProperty()
    order: number;

    @ApiProperty({ type: Object })
    data: Record<string, any>;

    @ApiProperty({ default: false })
    pinned: boolean;

    @ApiPropertyOptional({ type: () => BlockTemplateResponseDto })
    template?: BlockTemplateResponseDto;

    @ApiPropertyOptional({ type: () => [CommentResponseDto] })
    comments?: CommentResponseDto[];

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: string;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt: string;
}

export class PageResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ format: 'uuid' })
    siteId: string;

    @ApiProperty({ enum: PageType, enumName: 'PageType' })
    type: PageType;

    @ApiProperty()
    title: string;

    @ApiProperty()
    slug: string;

    @ApiProperty({ default: true })
    isVisible: boolean;

    @ApiPropertyOptional({ type: Object })
    seo?: Record<string, any> | null;

    @ApiPropertyOptional({ type: () => [BlockInstanceResponseDto] })
    blocks?: BlockInstanceResponseDto[];

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: string;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt: string;
}

export class ProductCategoryResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ format: 'uuid' })
    siteId: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    slug: string;

    @ApiPropertyOptional({ format: 'uuid' })
    parentId?: string | null;

    @ApiPropertyOptional({ type: () => [ProductCategoryResponseDto] })
    children?: ProductCategoryResponseDto[];

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: string;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt: string;
}

export class ProductMediaResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ format: 'uuid' })
    productId: string;

    @ApiProperty()
    url: string;

    @ApiPropertyOptional()
    alt?: string | null;

    @ApiProperty({ example: 0 })
    order: number;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: string;
}

export class ProductResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ format: 'uuid' })
    siteId: string;

    @ApiPropertyOptional({ format: 'uuid' })
    categoryId?: string | null;

    @ApiProperty()
    title: string;

    @ApiPropertyOptional()
    description?: string | null;

    @ApiProperty({ type: String, description: 'Стоимость товара в валюте сайта' })
    price: string;

    @ApiProperty({ default: 'RUB' })
    currency: string;

    @ApiPropertyOptional()
    sku?: string | null;

    @ApiProperty({ example: 0 })
    stock: number;

    @ApiProperty({ enum: StockStatus, enumName: 'StockStatus' })
    stockStatus: StockStatus;

    @ApiProperty({ type: () => [ProductMediaResponseDto] })
    media: ProductMediaResponseDto[];

    @ApiPropertyOptional({ type: () => ProductCategoryResponseDto })
    category?: ProductCategoryResponseDto | null;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: string;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt: string;
}

export class CartItemResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ format: 'uuid' })
    cartId: string;

    @ApiProperty({ format: 'uuid' })
    productId: string;

    @ApiProperty({ example: 1 })
    quantity: number;

    @ApiProperty({ type: String })
    price: string;

    @ApiPropertyOptional({ type: () => ProductResponseDto })
    product?: ProductResponseDto;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: string;
}

export class CartResponseDto {
    @ApiPropertyOptional({ format: 'uuid' })
    id?: string;

    @ApiProperty({ format: 'uuid' })
    siteId: string;

    @ApiPropertyOptional({ format: 'uuid' })
    userId?: string | null;

    @ApiPropertyOptional()
    sessionId?: string | null;

    @ApiProperty({ type: () => [CartItemResponseDto] })
    items: CartItemResponseDto[];

    @ApiPropertyOptional({ type: String, format: 'date-time' })
    createdAt?: string;

    @ApiPropertyOptional({ type: String, format: 'date-time' })
    updatedAt?: string;

    @ApiPropertyOptional({ type: String, description: 'Итог по корзине, если рассчитан' })
    total?: string;
}

export class OrderItemResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ format: 'uuid' })
    orderId: string;

    @ApiProperty({ format: 'uuid' })
    productId: string;

    @ApiProperty()
    title: string;

    @ApiProperty({ type: String })
    price: string;

    @ApiProperty({ example: 1 })
    quantity: number;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: string;
}

export class OrderResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ format: 'uuid' })
    siteId: string;

    @ApiPropertyOptional({ format: 'uuid' })
    userId?: string | null;

    @ApiPropertyOptional({ format: 'uuid' })
    cartId?: string | null;

    @ApiProperty({ type: String })
    total: string;

    @ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
    status: OrderStatus;

    @ApiProperty({ enum: PaymentStatus, enumName: 'PaymentStatus' })
    paymentStatus: PaymentStatus;

    @ApiPropertyOptional({ type: Object })
    shippingAddress?: Record<string, any> | null;

    @ApiProperty()
    customerEmail: string;

    @ApiPropertyOptional()
    customerPhone?: string | null;

    @ApiProperty({ type: () => [OrderItemResponseDto] })
    items: OrderItemResponseDto[];

    @ApiPropertyOptional({ type: Object })
    paymentDetails?: Record<string, any>;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt: string;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt: string;
}

export class UsersListResponseDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 20 })
    limit: number;

    @ApiProperty({ example: 100 })
    total: number;

    @ApiProperty({ example: 5 })
    pages: number;

    @ApiProperty({ type: () => [UserResponseDto] })
    users: UserResponseDto[];
}
