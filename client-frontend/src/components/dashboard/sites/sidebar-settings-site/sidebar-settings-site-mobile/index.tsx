'use client';
import { Equal, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib";
import { cn } from "@/lib/utils";
import { BreadcrumbBlock } from "@/components";

const menuItems = siteConfig.siteSettinsgsLinks;

export function SidebarSettingsSiteModile() {
    const [menuState, setMenuState] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 4);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return (
        <>
            <header className="border-b mb-6 pb-4">
                <nav
                    data-state={menuState && "active"}
                    className={cn(
                        `max-w-${siteConfig.maxWidthContent} mx-auto w-full px-3 md:px-4 transition-colors duration-300`,
                        isScrolled && "border-transparent"
                    )}
                >
                    <div
                        className={cn(
                            "mx-auto mt-2 transition-all duration-300",
                            isScrolled &&
                            "bg-[oklch(0.141 0.005 285.823)]/50 max-w-5xl rounded-2xl border backdrop-blur-xl px-3"
                        )}
                    >
                        <div className="relative flex flex-wrap items-center justify-between gap-3 py-3">
                            <div className="flex w-full justify-between lg:w-auto gap-3">

                                <BreadcrumbBlock />

                                <div className="flex">
                                    <button
                                        onClick={() => setMenuState(!menuState)}
                                        aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                                        className="relative z-20 pr-4 block cursor-pointer p-2 pt-0 md:hidden"
                                    >
                                        <Equal className="in-data-[state=active]:rotate-180 scale-120 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto duration-200" />
                                        <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-120 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                                    </button>
                                </div>
                            </div>

                            <div className="in-data-[state=active]:block border backdrop-blur-2xl lg:in-data-[state=active]:flex hidden w-full flex-wrap items-center justify-end space-y-8 rounded-sm p-3 shadow-3xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                                <div className="lg:hidden block p-3">
                                    <ul className="space-y-6 text-base">
                                        {menuItems.map((item, index) => (
                                            <li key={index}>
                                                <Link
                                                    href={item.href}
                                                    className="text-muted-foreground hover:text-primary text-sm block duration-150"
                                                >
                                                    <span>{item.label}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        </>
    );
}