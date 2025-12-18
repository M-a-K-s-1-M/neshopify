"use client";

import Image from "next/image";

import type { ProductDto } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/utils/media";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

export function ProductCardMedia({
    product,
    className,
    imageClassName,
}: {
    product: ProductDto;
    className?: string;
    imageClassName?: string;
}) {
    const media = product.media?.slice().sort((a, b) => a.order - b.order) ?? [];
    if (media.length === 0) return null;

    if (media.length === 1) {
        const item = media[0];
        return (
            <div className={className}>
                <Image
                    src={resolveMediaUrl(item.url)}
                    alt={item.alt ?? product.title}
                    fill
                    unoptimized
                    className={imageClassName}
                />
            </div>
        );
    }

    return (
        <div className={className}>
            <Carousel className="h-full w-full" opts={{ loop: true }}>
                <CarouselContent containerClassName="h-full" className="ml-0 h-full">
                    {media.map((item) => (
                        <CarouselItem key={item.id} className="basis-full pl-0 h-full">
                            <div className="relative h-full w-full">
                                <Image
                                    src={resolveMediaUrl(item.url)}
                                    alt={item.alt ?? product.title}
                                    fill
                                    unoptimized
                                    className={imageClassName}
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
            </Carousel>
        </div>
    );
}
