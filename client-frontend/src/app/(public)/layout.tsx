'use client'
import { siteConfig, TextType } from "@/components";
import { Button } from "@/components/ui/button";

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <section className="min-h-screen">
            <header className="absolute flex justify-between p-3 w-full">
                <div>
                    <h2 className="text-black font-bold text-2xl ">
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
                    <Button variant={'ghost'} className="cursor-pointer text-black md:text-white">Войти</Button>

                    <Button variant={'ghost'} className="cursor-pointer text-black md:text-white">Регистрация</Button>
                </div>

            </header>

            <main className="h-screen overflow-y-hidden">
                {children}
            </main>
        </section>
    )
}
