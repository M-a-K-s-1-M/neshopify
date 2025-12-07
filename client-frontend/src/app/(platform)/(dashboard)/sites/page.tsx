
import { BreadcrumbBlock, CreateSiteBtn, HeaderPage, Separator, SiteCard } from "@/components";

export default function Sites() {
    return (
        <div className="max-w-5xl mx-auto">
            <HeaderPage>
                <CreateSiteBtn />
            </HeaderPage>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <SiteCard />
                <SiteCard />
                <SiteCard />
                <SiteCard />
            </div>
        </div>
    )
}
