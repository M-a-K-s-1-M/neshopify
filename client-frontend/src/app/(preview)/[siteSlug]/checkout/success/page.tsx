import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function CheckoutSuccessPage({
    params,
    searchParams,
}: {
    params: Promise<{ siteSlug: string }>;
    searchParams: Promise<{ orderId?: string; session_id?: string }>;
}) {
    const { siteSlug } = await params;
    const { orderId } = await searchParams;

    return (
        <div className="mx-auto max-w-2xl px-6 py-10">
            <h1 className="text-2xl font-semibold">Оплата прошла успешно</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                {orderId ? `Заказ: ${orderId}` : 'Заказ создан.'}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                    <Link href={`/${siteSlug}`}>На главную</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href={`/${siteSlug}/cart`}>В корзину</Link>
                </Button>
            </div>
        </div>
    );
}
