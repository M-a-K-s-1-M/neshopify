import { PlatformFooter, PlatformHeader } from "@/components";
import { RequireAuth } from "@/components/providers/require-auth";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
    return (
        <RequireAuth>
            <section className="min-h-screen flex flex-col w-full">
                <PlatformHeader />

                <main className="flex-1 w-full max-w-7xl mx-auto p-5">{children}</main>

                <PlatformFooter />
            </section>
        </RequireAuth>
    )
}
