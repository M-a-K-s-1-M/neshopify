"use client";

import { Heart, Loader2, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

import { ProductCardMedia } from "./product-card-media";
import { getProductPriceLabel, type ProductCardProps } from "./types";

export function ProductCardTwo({
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
				"w-full max-w-[320px] mx-auto rounded-3xl not-prose overflow-hidden p-0 shadow-md",
				className,
			)}
		>
			<CardContent className="p-0 overflow-hidden">
				<div className="relative aspect-3/2 overflow-hidden bg-muted">
					<ProductCardMedia
						product={product}
						className="absolute inset-0"
						imageClassName="object-cover"
					/>
				</div>

				{/* Profile Info */}
				<div className="relative z-10 -mt-12 rounded-t-3xl bg-card p-6">
					<div className="flex items-center justify-between gap-4 mb-4">
						<div>
							<CardTitle>{title}</CardTitle>
							{description ? <CardDescription>{description}</CardDescription> : null}
						</div>

						<p className="text-2xl font-bold">{priceLabel}</p>
					</div>

					<div className="flex items-center justify-between gap-2">
						<Button className="flex-1" onClick={onToggleCart} disabled={!onToggleCart || cartBusy}>
							{cartBusy ? (
								<span className="flex items-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									{inCart ? "Удаляем" : "Добавляем"}
								</span>
							) : inCart ? (
								"Убрать"
							) : (
								<span className="flex items-center gap-2">
									<ShoppingCart className="h-4 w-4" /> Купить
								</span>
							)}
						</Button>
						<Button
							size="icon"
							variant="outline"
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
			</CardContent>
		</Card>
	);
}
