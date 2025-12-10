'use client'
import { siteConfig } from "@/lib";
import { Button } from "@/components/ui/button";
import { TextType } from "@/components";
import Link from "next/link";
import { CheckAuthWelcome } from "@/components/providers/check-auth-welcome";

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <CheckAuthWelcome>
            <section className="min-h-screen">
                <header className="absolute flex justify-between p-3 w-full">
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

                <main className="h-screen overflow-y-hidden">
                    {children}
                </main>
            </section>
        </CheckAuthWelcome >
    )
}
