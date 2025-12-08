import { AnalyticsSite, OrdersTable } from "@/components";

export default function Review() {
    return (
        <div>
            <div className="mb-6">

                <AnalyticsSite />
            </div>

            <div>
                <h2 className="text-2xl font-bold text-secondary">Последние заказы</h2>
                <OrdersTable />
            </div>
        </div>
    )
}
