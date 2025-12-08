'use client'

import { HeaderPage, SidebarSettingsSite } from "@/components"
import { SidebarSettingsSiteModile } from "@/components"


export default function LayoutSettingsSite({ children }: { children: React.ReactNode }) {
    return (
        <section >
            <SidebarSettingsSiteModile />

            <div className="grid grid-cols-1 lg:grid-cols-14 lg:gap-6">

                <div className=" lg:col-span-3">
                    <SidebarSettingsSite />
                </div>

                <main className="lg:col-span-11">
                    {children}
                </main>

            </div>
        </section>
    )
}
