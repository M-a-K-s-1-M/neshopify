'use client'
import { Button, Card, CardContent, CardFooter } from "@/components";
import { siteConfig } from "@/lib";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";


export function SidebarSettingsSite() {
    const params = useParams();
    const siteId = params.siteId;
    const pathname = usePathname().split('/').slice(-1)[0];
    console.log(pathname);

    return (
        <Card className="bg-sidebar text-sidebar-foreground rounded-sm py-4 hidden lg:block transition-width duration-150">
            <CardContent className="px-3">
                <ul className="flex flex-col gap-2">
                    {siteConfig.siteSettinsgsLinks.map(link => (
                        <li key={link.label}>
                            <Button className="w-full rounded" variant={pathname === 'settings' && link.href === '' ? 'secondary' : pathname === link.href ? 'secondary' : 'ghost'} asChild>
                                <Link className="justify-start" href={`/sites/${siteId}/settings/${link.href}`}>{link.label}</Link>
                            </Button>
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter className="px-3 border-t mt-4">
                <Button variant="ghost" className="w-full rounded" asChild>
                    <Link className="justify-start" href={`/sites/${siteId}`}>Назад</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
