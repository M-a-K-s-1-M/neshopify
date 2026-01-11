"use client";

import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

import { ProductCardMedia } from "./product-card-media";
import { ProductDetailsDialog } from "./product-details-dialog";
import { getProductPriceLabel, type ProductCardProps } from "./types";

export function ProductCardOne({
	product,
	isFavorited = false,
	inCart = false,
	cartQuantity,
	cartBusy = false,
	onToggleFavorite,
	onToggleCart,
	onAddToCart,
	onRemoveFromCart,
	onUpdateCartQuantity,
	className,
}: ProductCardProps) {
	const title = product.title ?? "Товар";
	const description = product.description?.trim() ? product.description : null;
	const priceLabel = getProductPriceLabel(product);

	return (
		<Card className={cn("w-full max-w-[320px] shadow-md", className)}>
			<CardContent>
				<div className="relative mb-6">
					<div className="relative flex h-[280px] items-center justify-center overflow-hidden rounded-2xl bg-muted">
						<ProductCardMedia
							product={product}
							className="absolute inset-0"
							imageClassName="object-contain"
						/>
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-2 top-2"
							onClick={onToggleFavorite}
							disabled={!onToggleFavorite}
						>
							<Heart
								className={cn(
									"h-6 w-6 transition-colors",
									isFavorited
										? "fill-current text-primary"
										: "text-muted-foreground hover:text-foreground",
								)}
							/>
						</Button>
					</div>
				</div>

				<div className="mb-4">
					<CardTitle className="mb-2 text-xl leading-tight">{title}</CardTitle>
					{description ? (
						<CardDescription className="text-sm">{description}</CardDescription>
					) : null}
				</div>

				<div className="flex items-center justify-between">
					<p className="text-2xl font-bold">{priceLabel}</p>

					<ProductDetailsDialog
						product={product}
						inCart={inCart}
						cartQuantity={cartQuantity}
						cartBusy={cartBusy}
						onAddToCart={onAddToCart ?? (onToggleCart ? () => onToggleCart() : undefined)}
						onRemoveFromCart={onRemoveFromCart ?? (onToggleCart ? () => onToggleCart() : undefined)}
						onUpdateCartQuantity={onUpdateCartQuantity}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
