"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { AuthService } from "@/lib/api/apiAuth";
import { useAuthStore } from "@/stores/useAuthStore";

interface CheckAuthWelcomeProps {
    children: ReactNode;
}

export function CheckAuthWelcome({ children }: CheckAuthWelcomeProps) {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);
    const isAuth = useAuthStore((state) => state.isAuth);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const checkAuth = async () => {
            try {
                const profile = await AuthService.me();

                if (cancelled) {
                    return;
                }

                if (profile) {
                    setUser(profile);
                    router.replace("/sites");
                } else {
                    setUser(null);
                }
            } catch (error) {
                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setIsChecking(false);
                }
            }
        };

        checkAuth();

        return () => {
            cancelled = true;
        };
    }, [router, setUser]);

    if (isChecking) {
        return (
            <div className="flex min-h-[200px] w-full items-center justify-center text-sm text-muted-foreground">
                Проверяем доступ...
            </div>
        );
    }

    if (isAuth) {
        return (
            <div className="flex min-h-[200px] w-full items-center justify-center text-sm text-muted-foreground">
                Перенаправляем...
            </div>
        );
    }

    return <>{children}</>;
}