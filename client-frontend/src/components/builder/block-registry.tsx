import type { ComponentType } from "react";

import type { BlockInstanceDto } from "@/lib/types";
import { CatalogProductGridBlock } from "./blocks/catalog-product-grid";
import { CatalogSearchFilterBlock } from "./blocks/catalog-search-filter";
import { FooterContactsBlock } from "./blocks/footer-contacts-basic";
import { HeaderNavBasicBlock } from "./blocks/header-nav-basic";
import { HeroBrandHighlightBlock } from "./blocks/hero-brand-highlight";
import { ProductsFeaturedBlock } from "./blocks/products-featured";
import { ProfileAccountFormBlock } from "./blocks/profile-account-form";
import { ProfileFavoritesShowcaseBlock } from "./blocks/profile-favorites-showcase";
import { CartItemsListBlock } from "./blocks/cart-items-list";
import { FallbackBlock } from "./blocks/fallback-block";

export interface BlockRendererProps {
    block: BlockInstanceDto;
    siteId: string;
}

type BlockComponent = ComponentType<BlockRendererProps>;

const registry: Record<string, BlockComponent> = {
    "header-nav-basic": ({ block }) => <HeaderNavBasicBlock block={block} />,
    "hero-brand-highlight": ({ block }) => <HeroBrandHighlightBlock block={block} />,
    "products-featured": ({ block, siteId }) => (
        <ProductsFeaturedBlock block={block} siteId={siteId} />
    ),
    "catalog-search-filter": ({ block }) => <CatalogSearchFilterBlock block={block} />,
    "catalog-product-grid": ({ block, siteId }) => (
        <CatalogProductGridBlock block={block} siteId={siteId} />
    ),
    "footer-contacts-basic": ({ block }) => <FooterContactsBlock block={block} />,
    "profile-account-form": ({ block }) => <ProfileAccountFormBlock block={block} />,
    "profile-favorites-showcase": ({ block }) => <ProfileFavoritesShowcaseBlock block={block} />,
    "cart-items-list": ({ block }) => <CartItemsListBlock block={block} />,
};

const FallbackComponent: BlockComponent = ({ block }) => <FallbackBlock block={block} />;

export function BlockRenderer(props: BlockRendererProps) {
    const templateKey = props.block.template.key;
    const Component = registry[templateKey] ?? FallbackComponent;
    return <Component {...props} />;
}

export function registerBlock(key: string, component: BlockComponent) {
    registry[key] = component;
}
