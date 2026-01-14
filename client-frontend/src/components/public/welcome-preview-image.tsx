'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';

export function WelcomePreviewImage() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const src = useMemo(() => {
        if (!mounted) return null;
        return resolvedTheme === 'dark' ? '/preview-dark.png' : '/preview-light.png';
    }, [mounted, resolvedTheme]);

    return (
        <div className="relative h-full w-full m-0 p-0">
            <div className="relative h-full w-full m-0 p-0">
                {src ? (
                    <Image
                        src={src}
                        alt="Превью интерфейса Cosmiq"
                        fill
                        priority
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-fill"
                    />
                ) : (
                    <div className="absolute inset-0 bg-muted/20" />
                )}
            </div>
        </div>
    );
}
