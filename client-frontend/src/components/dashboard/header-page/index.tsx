import { BreadcrumbBlock } from "@/components/shared";

export function HeaderPage({ children }: { children: React.ReactNode }) {
    return (
        <div className="py-5 flex justify-between gap-5 border-b mb-5">
            <BreadcrumbBlock />

            <div>
                {children}
            </div>
        </div>
    )
}
