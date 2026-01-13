export type SiteStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type PageType = "HOME" | "CATALOG" | "CART" | "PROFILE" | "CUSTOM";
export type BlockCategory = "HERO" | "PRODUCT" | "REVIEWS" | "CTA" | "CONTENT" | "NAVIGATION" | "GENERAL";
export type SiteMemberRole = "ADMIN" | "EDITOR" | "VIEWER";
export type StockStatus = "IN_STOCK" | "OUT_OF_STOCK" | "PREORDER";

export interface SiteMemberDto {
    id: string;
    role: SiteMemberRole;
    user: {
        id: string;
        email: string;
    };
}

export interface SiteDto {
    id: string;
    name: string;
    slug: string;
    domain?: string | null;
    status: SiteStatus;
    ownerId: string;
    theme?: Record<string, unknown> | null;
    seo?: Record<string, unknown> | null;
    plan?: string | null;
    publishedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    members?: SiteMemberDto[];
}

export interface BlockTemplateDto {
    id: string;
    key: string;
    title: string;
    description?: string | null;
    category: BlockCategory;
    schema: Record<string, unknown>;
    previewUrl?: string | null;
}

export interface BlockInstanceDto {
    id: string;
    pageId: string;
    order: number;
    pinned: boolean;
    data: Record<string, unknown>;
    templateId: string;
    template: BlockTemplateDto;
}

export interface PageDto {
    id: string;
    siteId: string;
    type: PageType;
    title: string;
    slug: string;
    isVisible: boolean;
    seo?: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
    blocks?: BlockInstanceDto[];
}

export interface ProductMediaDto {
    id: string;
    url: string;
    alt?: string | null;
    order: number;
}

export interface ProductCategoryDto {
    id: string;
    siteId: string;
    name: string;
    slug: string;
    parentId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ProductDto {
    id: string;
    siteId: string;
    categoryId?: string | null;
    title: string;
    description?: string | null;
    price: string | number;
    currency: string;
    sku?: string | null;
    stock: number;
    stockStatus: StockStatus;
    media?: ProductMediaDto[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductPayload {
    title: string;
    description?: string;
    price: number;
    currency?: string;
    sku?: string;
    stock?: number;
    stockStatus?: StockStatus;
    categoryId?: string;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

export interface SiteUserDto {
    id: string;
    email: string;
    banned: boolean;
    siteId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SiteAnalyticsSummaryDto {
    totalSales: string;
    ordersCount: number;
    customersCount: number;
    conversionPercent: number;
}

export interface CreateSitePayload {
    name: string;
    slug: string;
    domain?: string;
    plan?: string;
    theme?: Record<string, unknown>;
    seo?: Record<string, unknown>;
}

export type UpdateSitePayload = Partial<CreateSitePayload>;

export interface CreatePagePayload {
    title: string;
    slug: string;
    type?: PageType;
    isVisible?: boolean;
    seo?: Record<string, unknown>;
}

export type UpdatePagePayload = Partial<CreatePagePayload>;

export interface CreateBlockPayload {
    templateId?: string;
    templateKey?: string;
    order?: number;
    pinned?: boolean;
    data: Record<string, unknown>;
}

export type UpdateBlockPayload = Partial<CreateBlockPayload>;
