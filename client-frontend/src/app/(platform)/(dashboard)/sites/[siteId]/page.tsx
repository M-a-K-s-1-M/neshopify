import { AddPageBtn, EditPageBtn, HeaderPage, SettingsSiteBtn } from "@/components";
import { PageCard } from "@/components/dashboard/sites/page-card";

export default function Site() {
    return (
        <div>
            <HeaderPage>
                <div className="flex gap-2">
                    <SettingsSiteBtn href='1/settings/review' />
                    <AddPageBtn />
                </div>
            </HeaderPage>

            <div className="flex flex-col gap-3">
                <PageCard />
                <PageCard />
                <PageCard />
            </div>
        </div>
    )
}
