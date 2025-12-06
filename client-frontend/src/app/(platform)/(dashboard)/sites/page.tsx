import { SiteCard } from "@/components";

export default function Sites() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <SiteCard />
                <SiteCard />
                <SiteCard />
                <SiteCard />
            </div>
        </div>
    )
}
