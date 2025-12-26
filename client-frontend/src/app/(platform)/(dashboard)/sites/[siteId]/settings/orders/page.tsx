import { OrdersTable } from "@/components";

export default async function Orders({
    params,
}: {
    params: Promise<{ siteId: string }>;
}) {
    const { siteId } = await params;

    return (
        <div>
            <h2 className="text-2xl font-bold text-secondary">Последние заказы</h2>
            <OrdersTable siteId={siteId} />
        </div>
    )
}
