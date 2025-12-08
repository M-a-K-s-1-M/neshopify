import { OrdersTable } from "@/components";

export default function Orders() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-secondary">Последние заказы</h2>
            <OrdersTable />
        </div>
    )
}
