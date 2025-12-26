import { SiteBasePathProvider } from "@/components/providers/site-base-path-provider";
import { AuthBootstrap } from "@/components/providers/auth-bootstrap";

export default async function StorefrontSlugLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ siteSlug: string }>;
}) {
    const { siteSlug } = await params;
    const basePath = `/${siteSlug}`;

    return (
        <SiteBasePathProvider basePath={basePath}>
            <AuthBootstrap>{children}</AuthBootstrap>
        </SiteBasePathProvider>
    );
}
