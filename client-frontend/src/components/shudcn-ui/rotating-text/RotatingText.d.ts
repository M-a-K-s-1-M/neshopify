import * as React from 'react';

export type RotatingTextHandle = {
    next: () => void;
    previous: () => void;
    jumpTo: (index: number) => void;
    reset: () => void;
};

export type RotatingTextProps = React.HTMLAttributes<HTMLSpanElement> & {
    texts: string[];
    transition?: unknown;
    initial?: unknown;
    animate?: unknown;
    exit?: unknown;
    animatePresenceMode?: 'wait' | 'sync' | 'popLayout' | (string & {});
    animatePresenceInitial?: boolean;
    rotationInterval?: number;
    staggerDuration?: number;
    staggerFrom?: 'first' | 'last' | 'center' | 'random' | number;
    loop?: boolean;
    auto?: boolean;
    splitBy?: 'characters' | 'words' | 'lines' | string;
    onNext?: (nextIndex: number) => void;
    mainClassName?: string;
    splitLevelClassName?: string;
    elementLevelClassName?: string;
};

export const RotatingText: React.ForwardRefExoticComponent<
    RotatingTextProps & React.RefAttributes<RotatingTextHandle>
>;
