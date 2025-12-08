'use client'

import { HeaderPage, SidebarSettingsSite } from "@/components"
import { SidebarSettingsSiteModile } from "@/components"


export default function LayoutSettingsSite({ children }: { children: React.ReactNode }) {
    return (
        <section >
            <SidebarSettingsSiteModile />

            <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
                <div className="col-span-3 lg:col-span-2">
                    <SidebarSettingsSite />
                </div>

                <main className="col-span-7 lg:col-span-8">
                    {children}
                </main>
            </div>
        </section>
    )
}
