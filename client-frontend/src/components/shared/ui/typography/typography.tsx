export function TextH1({ children }: { children?: React.ReactNode }) {
    return (
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
            {children}
        </h1>
    )
}

export function TextH2({ children }: { children?: React.ReactNode }) {
    return (
        <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            {children}
        </h2>
    )
}

export function TextH3({ children }: { children?: React.ReactNode }) {
    return (
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            {children}
        </h3>
    )
}

export function TextH4({ children }: { children?: React.ReactNode }) {
    return (
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {children}
        </h4>
    )
}

export function TextP({ children }: { children?: React.ReactNode }) {
    return (
        <p className="leading-7 [&:not(:first-child)]:mt-6">
            {children}
        </p>
    )
}

export function TextBlockquote() {
    return (
        <blockquote className="mt-6 border-l-2 pl-6 italic">
            &quot;After all,&quot; he said, &quot;everyone enjoys a good joke, so
            it&apos;s only fair that they should pay for the privilege.&quot;
        </blockquote>
    )
}

export function TextLarge({ children }: { children?: React.ReactNode }) {
    return <div className="text-lg font-semibold">{children}</div>
}

export function TextSmall({ children }: { children?: React.ReactNode }) {
    return (
        <small className="text-sm leading-none font-medium">{children}</small>
    )
}

export function TextMuted({ children }: { children?: React.ReactNode }) {
    return (
        <p className="text-muted-foreground text-sm">{children}</p>
    )
}

