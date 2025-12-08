import { useEffect, useState } from "react";

// Returns true when the provided media query matches on the client
export function useMediaQuery(query: string) {
    const getMatch = () =>
        typeof window !== "undefined" ? window.matchMedia(query).matches : false;

    const [matches, setMatches] = useState(getMatch);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const mediaQuery = window.matchMedia(query);
        const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

        setMatches(mediaQuery.matches);

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", listener);
        } else {
            mediaQuery.addListener(listener);
        }

        return () => {
            if (typeof mediaQuery.removeEventListener === "function") {
                mediaQuery.removeEventListener("change", listener);
            } else {
                mediaQuery.removeListener(listener);
            }
        };
    }, [query]);

    return matches;
}
