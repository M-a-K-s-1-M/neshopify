import { AnalyticsSite, ChartRegisterUsers } from "@/components";

export default function Analytics() {
    return (
        <div>
            <div className="mb-5">
                <AnalyticsSite />
            </div>

            <div>
                <ChartRegisterUsers />
            </div>
        </div>
    )
}
