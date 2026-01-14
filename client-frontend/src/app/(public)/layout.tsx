'use client'
import { siteConfig } from "@/lib";
import { Button } from "@/components/ui/button";
import { TextType } from "@/components";
import Link from "next/link";
import { CheckAuthWelcome } from "@/components/providers/check-auth-welcome";

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <CheckAuthWelcome>
            <section className="min-h-screen flex flex-col">
                <header className="flex h-16 w-full shrink-0 items-center justify-between px-3">
                    <div>
                        <h2 className="text-foreground font-bold text-2xl ">
                            <TextType
                                text={siteConfig.name}
                                showCursor={false}
                                typingSpeed={100}
                                deletingSpeed={100}
                                pauseDuration={5000}
                                variableSpeed={undefined}
                                onSentenceComplete={undefined}
                            />
                        </h2>
                    </div>

                    <div className="flex flex-wrap-reverse justify-end">
                        <Button variant={'ghost'} className="cursor-pointer text-foreground" asChild>
                            <Link href="auth">
                                Войти
                            </Link>
                        </Button>

                        <Button variant={'ghost'} className="cursor-pointer text-foreground" asChild>
                            <Link href="auth/register">
                                Регистрация
                            </Link>
                        </Button>
                    </div>

                </header>

                <main className="h-[calc(100vh-4rem)] overflow-hidden">
                    {children}
                </main>
            </section>
        </CheckAuthWelcome >
    )
}
