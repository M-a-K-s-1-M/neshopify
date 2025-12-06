import { PlatformHeader } from "@/components";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
    return (
        <section className="min-h-screen flex flex-col w-full">
            <PlatformHeader />

            <main className="flex-1 w-full max-w-7xl mx-auto p-5">{children}</main>

            <footer>
                Platform Footer
            </footer>
        </section>
    )
}
