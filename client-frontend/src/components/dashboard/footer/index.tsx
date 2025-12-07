import { siteConfig } from "@/components/shared";
import { Button, Separator } from "@/components";
import Link from "next/link";

const footerLinks = [
    { label: 'Помощь', href: '/' },
    { label: 'Контакты', href: '/' },
    { label: 'Блог', href: '/' },
];

export function PlatformFooter() {
    return (
        <>
            <Separator />
            <footer>
                <div className={`max-w-${siteConfig.maxWidthContent}
                w-full mx-auto flex justify-between gap-5 flex-wrap-reverse
                px-6 py-5 items-center`}
                >
                    <h3 className="font-medium">
                        &copy; 2025 {siteConfig.name}
                    </h3>

                    <ul className="flex flex-wrap gap-4">
                        {siteConfig.footerLinks.map(link => (
                            <li key={link.label} >
                                <Button asChild variant={'link'} size={'sm'} className={`p-0`} >
                                    <Link href={link.href}>
                                        {link.label}
                                    </Link>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            </footer>
        </>
    )
}
