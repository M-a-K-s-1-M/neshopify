import { SiteBasePathProvider } from "@/components/providers/site-base-path-provider";
import { AuthBootstrap } from "@/components/providers/auth-bootstrap";

export default async function StorefrontIdSlugLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ siteSlug: string; siteName: string }>;
}) {
    const { siteSlug, siteName } = await params;

    // В этом маршруте siteSlug фактически содержит siteId (UUID), а siteName — slug сайта.
    const basePath = `/${siteSlug}/${siteName}`;

    return (
        <SiteBasePathProvider basePath={basePath}>
            <AuthBootstrap>{children}</AuthBootstrap>
        </SiteBasePathProvider>
    );
}
