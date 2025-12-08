import { PlatformFooter } from "@/components";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <section className="flex flex-col min-h-screen">

            <main className="flex-1 flex justify-center items-center" >
                {children}
            </main>

            <PlatformFooter />
        </section>
    )
}
