import { BreadcrumbBlock, EditInfoUserCard, HeaderPage } from "@/components";

export default function Profile() {
    return (
        <section className="max-w-5xl mx-auto">
            <HeaderPage>
                <p>Профиль</p>
            </HeaderPage>

            <div >
                <EditInfoUserCard />
            </div>
        </section>
    )
}
