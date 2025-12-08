'use client'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, gifUrls, TextGif } from "@/components";
import { siteConfig } from "@/lib";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthFormLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname().split('/').slice(-1)[0];

    return (
        <Card className="min-w-sm md:min-w-md shadow-md">
            <CardHeader className="text-center mt-10">
                <CardTitle>
                    <TextGif
                        gifUrl={gifUrls[3]}
                        text={siteConfig.name}
                        size={'md'}
                        weight={'bold'}
                    />
                </CardTitle>
                <CardDescription className="mb-3">
                    {siteConfig.description}
                </CardDescription>

                <div className="grid grid-cols-2">
                    <Button variant="ghost" size="sm" className={cn('rounded-none', pathname === 'auth' ? 'border-b border-b-primary' : 'border-b')} asChild>
                        <Link href='/auth'>Вход</Link>
                    </Button>
                    <Button variant="ghost" size="sm" className={cn('rounded-none', pathname === 'register' ? 'border-b border-b-primary' : 'border-b')} asChild>
                        <Link href='/auth/register'>Регистрация</Link>
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {children}
            </CardContent>
        </Card>
    )
}
