"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

import { ProductCardMedia } from "./product-card-media";
import { getProductPriceLabel, type ProductCardProps } from "./types";

export function ProductCardThree({
	product,
	isFavorited = false,
	inCart = false,
	cartBusy = false,
	onToggleFavorite,
	onToggleCart,
	className,
}: ProductCardProps) {
	const title = product.title ?? "Товар";
	const description = product.description?.trim() ? product.description : null;
	const priceLabel = getProductPriceLabel(product);

	return (
		<Card
			className={cn(
				"w-full max-w-[320px] mx-auto border-2 border-border shadow-md rounded-none overflow-hidden p-0 not-prose",
				className,
			)}
		>
			<CardContent className="p-0">
				<div className="relative aspect-square bg-muted">
					<ProductCardMedia
						product={product}
						className="absolute inset-0"
						imageClassName="object-cover"
					/>

					<Button
						variant="secondary"
						size="icon"
						className="absolute top-4 right-4 rounded-none"
						onClick={onToggleFavorite}
						disabled={!onToggleFavorite}
					>
						<Heart
							className={cn(
								"h-5 w-5 transition-colors",
								isFavorited ? "fill-current text-foreground" : "text-foreground",
							)}
						/>
					</Button>
				</div>

				<div className="p-4">
					<div className="text-center mb-4">
						<h3 className="text-2xl mb-1">{title}</h3>
						{description ? (
							<p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
						) : null}
						<p className="text-3xl font-bold mt-3">{priceLabel}</p>
					</div>

					<Button
						size="lg"
						className="rounded-none w-full"
						onClick={onToggleCart}
						disabled={!onToggleCart || cartBusy}
					>
						{cartBusy ? (
							<span className="flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								{inCart ? "Удаляем" : "Добавляем"}
							</span>
						) : inCart ? (
							"Убрать из корзины"
						) : (
							<span className="flex items-center gap-2">
								<ShoppingCart className="h-4 w-4" /> В корзину
							</span>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
