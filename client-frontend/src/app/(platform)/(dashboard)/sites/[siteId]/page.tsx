import { EditPageBtn, HeaderPage, SettingsSiteBtn } from "@/components";
import PageCard from "@/components/dashboard/sites/page-card";

export default function Site() {
    return (
        <div>
            <HeaderPage>
                <SettingsSiteBtn href='/sites/siteId/settings' />

            </HeaderPage>

            <div className="flex flex-col gap-3">
                <PageCard />
                <PageCard />
                <PageCard />
            </div>
        </div>
    )
}
