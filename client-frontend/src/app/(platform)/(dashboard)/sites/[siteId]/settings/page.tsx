import { AnalyticsSite, OrdersTable } from "@/components";

export default async function Review({
    params,
}: {
    params: Promise<{ siteId: string }>;
}) {
    const { siteId } = await params;

    return (
        <div>
            <div className="mb-6">

                <AnalyticsSite />
            </div>

            <div>
                <h2 className="text-2xl font-bold text-secondary">Последние заказы</h2>
                <OrdersTable siteId={siteId} />
            </div>
        </div>
    )
}
