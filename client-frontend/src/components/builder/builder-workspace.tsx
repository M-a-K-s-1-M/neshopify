'use client'

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    Button,
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    Label,
    Input,
    Separator,
} from "@/components";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useSiteQuery, useSitePagesQuery, usePageDetailQuery, useBlockTemplatesQuery } from "@/lib/query/hooks";
import { SitePageView } from "./site-page-view";
import { BlockRenderer } from "./block-registry";
import type { BlockInstanceDto, BlockTemplateDto, CreateBlockPayload, PageDto, ProductDto, UpdateBlockPayload } from "@/lib/types";
import { getPresetsByTemplate } from "./block-presets";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { PageBlocksApi } from "@/lib/api/page-blocks";
import { PagesApi } from "@/lib/api/pages";
import { CategoriesApi } from "@/lib/api/categories";
import { ProductsApi } from "@/lib/api/products";
import { queryKeys } from "@/lib/query/keys";
import { DEFAULT_LAYOUT_BLOCKS, INTERNAL_LAYOUT_PAGE_SLUG } from "./default-page-blocks";

interface BuilderWorkspaceProps {
    siteId: string;
    pageSlug: string;
}

const VIEW_ONLY_PAGE_TYPES: Array<PageDto["type"]> = ["PROFILE", "CART"];
const VIEW_ONLY_MESSAGE = "Страницы профиля и корзины доступны только для просмотра.";

export function BuilderWorkspace({ siteId, pageSlug }: BuilderWorkspaceProps) {
    const queryClient = useQueryClient();
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [activeTemplateKey, setActiveTemplateKey] = useState<string | null>(null);

    const { data: site, isLoading: siteLoading, error: siteError } = useSiteQuery(siteId);
    const { data: pages, isLoading: pagesLoading, error: pagesError } = useSitePagesQuery(siteId);

    const layoutPage = useMemo(
        () => pages?.find((page) => page.slug === INTERNAL_LAYOUT_PAGE_SLUG),
        [pages],
    );
    const layoutPageId = layoutPage?.id;

    const currentPage = useMemo(() => pages?.find((page) => page.slug === pageSlug), [pages, pageSlug]);
    const isReadOnlyPage = currentPage ? VIEW_ONLY_PAGE_TYPES.includes(currentPage.type) : false;
    const pageId = currentPage?.id;

    const {
        data: pageDetail,
        isLoading: pageLoading,
        error: pageError,
    } = usePageDetailQuery(siteId, pageId);

    const {
        data: layoutDetail,
        isLoading: layoutLoading,
        error: layoutError,
    } = usePageDetailQuery(siteId, layoutPageId);

    const { data: templates, isLoading: templatesLoading } = useBlockTemplatesQuery();

    const pageTemplates = useMemo(() => {
        const items = templates ?? [];
        return items.filter(
            (tpl) => !tpl.key.startsWith('header-') && !tpl.key.startsWith('footer-'),
        );
    }, [templates]);

    const headerTemplates = useMemo(() => {
        const items = templates ?? [];
        return items.filter((tpl) => tpl.key.startsWith('header-'));
    }, [templates]);

    const footerTemplates = useMemo(() => {
        const items = templates ?? [];
        return items.filter((tpl) => tpl.key.startsWith('footer-'));
    }, [templates]);

    useEffect(() => {
        if (!activeTemplateKey && pageTemplates.length > 0) {
            setActiveTemplateKey(pageTemplates[0].key);
        }
        if (activeTemplateKey && pageTemplates.length > 0 && !pageTemplates.some((tpl) => tpl.key === activeTemplateKey)) {
            setActiveTemplateKey(pageTemplates[0].key);
        }
    }, [pageTemplates, activeTemplateKey]);

    useEffect(() => {
        if (isReadOnlyPage) {
            setIsLibraryOpen(false);
        }
    }, [isReadOnlyPage]);

    const pageBlocks = useMemo(() => {
        const raw = pageDetail?.blocks ? [...pageDetail.blocks].sort((a, b) => a.order - b.order) : [];
        // Не допускаем локальные header/footer на странице — они должны быть общими.
        return raw.filter(
            (block) => !block.template.key.startsWith('header-') && !block.template.key.startsWith('footer-'),
        );
    }, [pageDetail?.blocks]);

    const layoutBlocks = useMemo(() => {
        if (!layoutDetail?.blocks) {
            return [] as BlockInstanceDto[];
        }
        return [...layoutDetail.blocks].sort((a, b) => a.order - b.order);
    }, [layoutDetail?.blocks]);

    const blocks = useMemo(() => {
        if (layoutPageId) {
            const header = layoutBlocks.find((b) => b.template.key.startsWith('header-')) ?? null;
            const footer = layoutBlocks.find((b) => b.template.key.startsWith('footer-')) ?? null;
            return [
                ...(header ? [header] : []),
                ...pageBlocks,
                ...(footer ? [footer] : []),
            ];
        }

        // Fallback для старых сайтов: если layout еще не создан, показываем header/footer из страницы.
        const raw = pageDetail?.blocks ? [...pageDetail.blocks].sort((a, b) => a.order - b.order) : [];
        const header = raw.find((b) => b.template.key.startsWith('header-')) ?? null;
        const footer = raw.find((b) => b.template.key.startsWith('footer-')) ?? null;
        const content = raw.filter(
            (block) => !block.template.key.startsWith('header-') && !block.template.key.startsWith('footer-'),
        );

        return [
            ...(header ? [header] : []),
            ...content,
            ...(footer ? [footer] : []),
        ];
    }, [layoutPageId, layoutBlocks, pageBlocks, pageDetail?.blocks]);

    useEffect(() => {
        if (!selectedBlockId && blocks.length > 0) {
            setSelectedBlockId(blocks[0].id);
            return;
        }
        if (selectedBlockId && !blocks.some((block) => block.id === selectedBlockId)) {
            setSelectedBlockId(blocks[0]?.id ?? null);
        }
    }, [blocks, selectedBlockId]);

    const selectedBlock = blocks.find((block) => block.id === selectedBlockId) ?? null;
    const activeTemplate = pageTemplates.find((tpl) => tpl.key === activeTemplateKey) ?? pageTemplates?.[0] ?? null;

    const errorMessage = siteError
        ? getRequestErrorMessage(siteError, "Не удалось загрузить сайт")
        : pagesError
            ? getRequestErrorMessage(pagesError, "Не удалось загрузить страницы")
            : pageError
                ? getRequestErrorMessage(pageError, "Не удалось загрузить страницу")
                : layoutError
                    ? getRequestErrorMessage(layoutError, "Не удалось загрузить layout сайта")
                    : null;

    const isLoading = siteLoading || pagesLoading || pageLoading || layoutLoading;

    const invalidatePageById = async (targetPageId: string) => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.page(siteId, targetPageId) }),
            queryClient.invalidateQueries({ queryKey: queryKeys.pageBlocks(siteId, targetPageId) }),
        ]);
    };

    const invalidateCurrentPage = async () => {
        if (!pageId) return;
        await invalidatePageById(pageId);
    };

    const ensureLayoutMutation = useMutation({
        mutationFn: async () => {
            const seedHeader = pageDetail?.blocks?.find((b) => b.template.key.startsWith('header-'));
            const seedFooter = pageDetail?.blocks?.find((b) => b.template.key.startsWith('footer-'));

            const initialLayoutBlocks = [
                seedHeader
                    ? { templateKey: seedHeader.template.key, data: seedHeader.data, pinned: seedHeader.pinned }
                    : DEFAULT_LAYOUT_BLOCKS[0],
                seedFooter
                    ? { templateKey: seedFooter.template.key, data: seedFooter.data, pinned: seedFooter.pinned }
                    : DEFAULT_LAYOUT_BLOCKS[1],
            ];

            const layout = await PagesApi.create(siteId, {
                title: "Layout",
                slug: INTERNAL_LAYOUT_PAGE_SLUG,
                type: "CUSTOM",
                isVisible: false,
            });

            for (let index = 0; index < initialLayoutBlocks.length; index += 1) {
                const block = initialLayoutBlocks[index];
                await PageBlocksApi.create(siteId, layout.id, {
                    templateKey: block.templateKey,
                    data: block.data,
                    pinned: Boolean(block.pinned),
                    order: index + 1,
                });
            }

            return layout;
        },
        onSuccess: async (layout) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.sitePages(siteId) }),
                invalidatePageById(layout.id),
            ]);
        },
        onError: () => {
            // Тихо игнорируем: у пользователя может не быть прав OWNER/ADMIN.
        },
    });

    useEffect(() => {
        if (pagesLoading) return;
        if (!pages) return;
        if (layoutPageId) return;
        if (ensureLayoutMutation.isPending) return;

        // Для старых сайтов создаем служебную layout-страницу (общие header/footer)
        ensureLayoutMutation.mutate();
    }, [pagesLoading, pages, layoutPageId, ensureLayoutMutation.isPending, ensureLayoutMutation.mutate]);

    const createBlockMutation = useMutation({
        mutationFn: (payload: CreateBlockPayload) => PageBlocksApi.create(siteId, pageId as string, payload),
        onSuccess: async (block) => {
            await invalidateCurrentPage();
            setSelectedBlockId(block.id);
            setIsLibraryOpen(false);
        },
        onError: (error) => {
            window.alert(getRequestErrorMessage(error, "Не удалось добавить блок"));
        },
    });

    const updateBlockMutation = useMutation({
        mutationFn: async (params: {
            pageId: string;
            blockId: string;
            payload: UpdateBlockPayload;
            templateKey?: string;
            footerLinkTargets?: Array<{ id: string; pageId: string; data: unknown }>;
        }) => {
            const result = await PageBlocksApi.update(siteId, params.pageId, params.blockId, params.payload);

            if (
                params.templateKey === "header-nav-basic" &&
                params.footerLinkTargets &&
                params.footerLinkTargets.length > 0 &&
                params.payload.data
            ) {
                const headerData = params.payload.data;
                const nextLinks =
                    isPlainObject(headerData) && Array.isArray((headerData as Record<string, unknown>).links)
                        ? ((headerData as Record<string, unknown>).links as unknown[])
                        : null;

                const nextBrand =
                    isPlainObject(headerData) && typeof (headerData as Record<string, unknown>).logo === 'string'
                        ? ((headerData as Record<string, unknown>).logo as string)
                        : null;

                if (nextLinks || nextBrand !== null) {
                    await Promise.all(
                        params.footerLinkTargets.map((target) => {
                            const baseData = isPlainObject(target.data)
                                ? ({ ...(target.data as Record<string, unknown>) } as Record<string, unknown>)
                                : ({} as Record<string, unknown>);

                            return PageBlocksApi.update(siteId, target.pageId, target.id, {
                                data: {
                                    ...baseData,
                                    ...(nextLinks ? { links: nextLinks } : null),
                                    ...(nextBrand !== null ? { brand: nextBrand } : null),
                                },
                            });
                        }),
                    );
                }
            }

            return result;
        },
        onSuccess: async () => {
            // Инвалидируем текущую страницу и layout (если есть), чтобы изменения отразились везде.
            if (pageId) {
                await invalidatePageById(pageId);
            }
            if (layoutPageId) {
                await invalidatePageById(layoutPageId);
            }
        },
        onError: (error) => {
            window.alert(getRequestErrorMessage(error, "Не удалось сохранить блок"));
        },
    });

    const deleteBlockMutation = useMutation({
        mutationFn: (params: { pageId: string; blockId: string }) => PageBlocksApi.remove(siteId, params.pageId, params.blockId),
        onSuccess: async () => {
            if (pageId) {
                await invalidatePageById(pageId);
            }
            if (layoutPageId) {
                await invalidatePageById(layoutPageId);
            }
            setSelectedBlockId(null);
        },
        onError: (error) => {
            window.alert(getRequestErrorMessage(error, "Не удалось удалить блок"));
        },
    });

    const guardReadOnly = () => {
        if (!isReadOnlyPage) {
            return false;
        }
        window.alert(VIEW_ONLY_MESSAGE);
        return true;
    };

    const handleMoveBlock = async (blockId: string, direction: "up" | "down") => {
        if (guardReadOnly() || !pageId) {
            return;
        }

        const block = pageBlocks.find((item) => item.id === blockId);
        if (!block) {
            // Нельзя перемещать глобальные блоки (header/footer) в контексте страницы.
            return;
        }

        const currentIndex = pageBlocks.findIndex((item) => item.id === blockId);
        if (currentIndex === -1) {
            return;
        }
        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= pageBlocks.length) {
            return;
        }
        const currentBlock = pageBlocks[currentIndex];
        const targetBlock = pageBlocks[targetIndex];
        try {
            // Сервер сам делает безопасный reorder (учитывая @@unique([pageId, order])).
            await PageBlocksApi.update(siteId, pageId, currentBlock.id, { order: targetBlock.order });
            await invalidateCurrentPage();
            setSelectedBlockId(currentBlock.id);
        } catch (error) {
            window.alert(getRequestErrorMessage(error, "Не удалось изменить порядок блоков"));
        }
    };

    const handleAddPreset = (template: BlockTemplateDto, presetData: Record<string, unknown>) => {
        if (!pageId || guardReadOnly()) return;
        const nextOrder = pageBlocks.length > 0 ? pageBlocks[pageBlocks.length - 1].order + 1 : 1;
        createBlockMutation.mutate({
            templateKey: template.key,
            data: presetData,
            order: nextOrder,
        });
    };

    const handleSaveBlock = (blockId: string, payload: UpdateBlockPayload) => {
        if (guardReadOnly()) return;
        const target = blocks.find((item) => item.id === blockId);
        if (!target) {
            return;
        }

        const templateKey = target.template?.key;

        const footerLinkTargets =
            templateKey === "header-nav-basic"
                ? blocks
                    .filter((item) => item.template.key.startsWith("footer-"))
                    .map((item) => ({ id: item.id, pageId: item.pageId, data: item.data }))
                : [];

        updateBlockMutation.mutate({ pageId: target.pageId, blockId, payload, templateKey, footerLinkTargets });
    };

    const handleDeleteBlock = (blockId: string) => {
        if (guardReadOnly()) return;
        if (!window.confirm("Удалить блок?")) {
            return;
        }
        const target = blocks.find((item) => item.id === blockId);
        if (!target) {
            return;
        }
        // Глобальные header/footer не удаляем.
        if (layoutPageId && target.pageId === layoutPageId) {
            window.alert("Header/Footer общие для сайта — их нельзя удалить. Можно только заменить и отредактировать.");
            return;
        }

        deleteBlockMutation.mutate({ pageId: target.pageId, blockId });
    };

    if (!currentPage && !pagesLoading) {
        return (
            <div className="space-y-3">
                <h1 className="text-2xl font-semibold">Страница не найдена</h1>
                <p className="text-muted-foreground">
                    Мы не нашли страницу со slug "{pageSlug}". Проверьте URL или создайте новую страницу.
                </p>
            </div>
        );
    }

    const selectedContentIndex = selectedBlock
        ? pageBlocks.findIndex((block) => block.id === selectedBlock.id)
        : -1;
    const canMoveUp = selectedContentIndex > 0;
    const canMoveDown = selectedContentIndex >= 0 && selectedContentIndex < pageBlocks.length - 1;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Конструктор Cosmiq</p>
                    <h1 className="text-2xl font-semibold">{currentPage?.title ?? "Страница"}</h1>
                    <p className="font-mono text-sm text-muted-foreground">/{pageSlug}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{site?.name}</span>
                    <span>•</span>
                    <span>{blocks.length} блок(ов)</span>
                </div>
            </div>

            {isReadOnlyPage ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {VIEW_ONLY_MESSAGE}
                </div>
            ) : null}

            {errorMessage ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {errorMessage}
                </div>
            ) : null}

            {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Загрузка данных страницы...
                </div>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
                <aside className="space-y-6 rounded-2xl border border-border bg-card p-4">
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Блоки</p>
                            <span className="text-xs text-muted-foreground">{blocks.length}</span>
                        </div>
                        <div className="space-y-2">
                            {blocks.map((block) => (
                                <button
                                    key={block.id}
                                    type="button"
                                    className={cn(
                                        "w-full rounded-lg border px-3 py-2 text-left text-sm",
                                        selectedBlockId === block.id
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border hover:border-primary/40",
                                    )}
                                    onClick={() => setSelectedBlockId(block.id)}
                                >
                                    <p className="font-medium">{block.template.title}</p>
                                    <p className="text-xs text-muted-foreground">Позиция {block.order}</p>
                                </button>
                            ))}
                            {blocks.length === 0 ? (
                                <p className="text-sm text-muted-foreground">На странице пока нет блоков.</p>
                            ) : null}
                        </div>
                    </div>

                    <Drawer open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
                        <DrawerTrigger asChild>
                            <Button
                                className="w-full"
                                variant={'secondary'}
                                disabled={templatesLoading || pageTemplates.length === 0 || isReadOnlyPage}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Добавить блок
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent className="p-0 flex max-h-[90vh] flex-col overflow-hidden">
                            <DrawerHeader className="text-left">
                                <DrawerTitle>Добавить блок</DrawerTitle>
                                <DrawerDescription>Выберите шаблон и вариант блока.</DrawerDescription>
                            </DrawerHeader>
                            <div className="flex-1 overflow-y-auto border-t border-border p-4">
                                <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                                    <div className="space-y-2">
                                        {pageTemplates.map((template) => (
                                            <button
                                                key={template.id}
                                                type="button"
                                                className={cn(
                                                    "w-full rounded-lg border px-3 py-2 text-left text-sm",
                                                    template.key === activeTemplate?.key
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-border hover:border-primary/40",
                                                )}
                                                onClick={() => setActiveTemplateKey(template.key)}
                                            >
                                                <p className="font-medium">{template.title}</p>
                                                <p className="text-xs text-muted-foreground">{template.category}</p>
                                            </button>
                                        ))}
                                        {pageTemplates.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">Нет доступных шаблонов.</p>
                                        ) : null}
                                    </div>
                                    <div className="space-y-4">
                                        {activeTemplate ? (
                                            <>
                                                <div>
                                                    <h3 className="text-lg font-semibold">{activeTemplate.title}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {activeTemplate.description ?? "Шаблон блока"}
                                                    </p>
                                                </div>
                                                <PresetGrid
                                                    template={activeTemplate}
                                                    siteId={siteId}
                                                    onSelect={(data) => handleAddPreset(activeTemplate, data)}
                                                    isSubmitting={createBlockMutation.isPending}
                                                />
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Выберите шаблон слева.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DrawerFooter>
                                <DrawerClose asChild>
                                    <Button variant="outline">Закрыть</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                </aside>

                <section className="border-x-primary border-x-2 bg-background p-0 overflow-hidden">
                    <SitePageView slug={pageSlug} title={currentPage?.title} description={currentPage?.seo?.description as string | undefined} />
                </section>

                <aside className="rounded-2xl border border-border bg-card p-4">
                    <BlockEditorPanel
                        siteId={siteId}
                        block={selectedBlock}
                        onSave={handleSaveBlock}
                        onDelete={handleDeleteBlock}
                        onMove={handleMoveBlock}
                        isSaving={updateBlockMutation.isPending}
                        isDeleting={deleteBlockMutation.isPending}
                        readOnly={isReadOnlyPage}
                        readOnlyMessage={VIEW_ONLY_MESSAGE}
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        availablePages={pages ?? []}
                        availableTemplates={templates ?? []}
                        isGlobalBlock={Boolean(layoutPageId && selectedBlock?.pageId === layoutPageId)}
                    />
                </aside>
            </div>
        </div>
    );
}

function PresetGrid({
    template,
    siteId,
    onSelect,
    isSubmitting,
}: {
    template: BlockTemplateDto;
    siteId: string;
    onSelect: (data: Record<string, unknown>) => void;
    isSubmitting: boolean;
}) {
    const presets = getPresetsByTemplate(template.key);

    if (presets.length === 0) {
        return <p className="text-sm text-muted-foreground">Для шаблона пока нет пресетов.</p>;
    }

    return (
        <div className="space-y-3">
            <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
                {presets.map((preset) => {
                    const previewBlock: BlockInstanceDto = {
                        id: `preset-${preset.id}`,
                        pageId: "__preset_preview__",
                        order: 1,
                        pinned: false,
                        data: preset.data,
                        templateId: template.id,
                        template,
                    };

                    return (
                        <div
                            key={preset.id}
                            className="w-full rounded-xl border border-border p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium">{preset.name}</p>
                                    {preset.description ? (
                                        <p className="text-xs text-muted-foreground">{preset.description}</p>
                                    ) : null}
                                </div>
                                <Button
                                    size={'sm'}
                                    disabled={isSubmitting}
                                    onClick={() => onSelect(preset.data)}
                                >
                                    {isSubmitting ? "Добавляем..." : "Использовать"}
                                </Button>
                            </div>

                            <div className="mt-3 rounded-lg border border-border bg-background p-3">
                                <div className="w-full">
                                    <BlockRenderer block={previewBlock} siteId={siteId} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function BlockEditorPanel({
    siteId,
    block,
    onSave,
    onDelete,
    onMove,
    isSaving,
    isDeleting,
    readOnly,
    readOnlyMessage,
    canMoveUp,
    canMoveDown,
    availablePages,
    availableTemplates,
    isGlobalBlock,
}: {
    siteId: string;
    block: BlockInstanceDto | null;
    onSave: (blockId: string, payload: UpdateBlockPayload) => void;
    onDelete: (blockId: string) => void;
    onMove: (blockId: string, direction: "up" | "down") => void;
    isSaving: boolean;
    isDeleting: boolean;
    readOnly: boolean;
    readOnlyMessage: string;
    canMoveUp: boolean;
    canMoveDown: boolean;
    availablePages: PageDto[];
    availableTemplates: BlockTemplateDto[];
    isGlobalBlock: boolean;
}) {
    const [pinned, setPinned] = useState(false);
    const [order, setOrder] = useState(1);
    const [draftData, setDraftData] = useState<Record<string, unknown>>({});
    const [headerLinks, setHeaderLinks] = useState<Array<{ id: string; label: string; pageId: string }>>([]);
    const [headerActions, setHeaderActions] = useState<Array<{ id: string; label: string; href: string; variant?: string }>>([]);
    const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!block) {
            setPinned(false);
            setOrder(1);
            setDraftData({});
            setHeaderLinks([]);
            setHeaderActions([]);
            setSelectedTemplateKey("");
            setError(null);
            return;
        }
        setPinned(block.pinned);
        setOrder(block.order);
        setDraftData(isPlainObject(block.data) ? (block.data as Record<string, unknown>) : {});
        setSelectedTemplateKey(block.template.key);

        if (block.template.key === 'header-nav-basic') {
            const data = isPlainObject(block.data) ? (block.data as Record<string, any>) : {};
            const links = Array.isArray(data.links) ? data.links : [];
            const actions = Array.isArray(data.actions) ? data.actions : [];

            setHeaderLinks(
                links.map((link: any) => {
                    const pageId = typeof link?.pageId === 'string'
                        ? link.pageId
                        : resolvePageIdFromHref(availablePages, typeof link?.href === 'string' ? link.href : '');

                    return {
                        id: createEntryId(),
                        label: typeof link?.label === 'string' ? link.label : 'Ссылка',
                        pageId: pageId ?? '',
                    };
                }),
            );

            setHeaderActions(
                actions.map((action: any) => ({
                    id: createEntryId(),
                    label: typeof action?.label === 'string' ? action.label : 'Действие',
                    href: typeof action?.href === 'string' ? action.href : '#',
                    variant: typeof action?.variant === 'string' ? action.variant : undefined,
                })),
            );
        } else {
            setHeaderLinks([]);
            setHeaderActions([]);
        }
        setError(null);
    }, [block, availablePages]);

    const currentTemplateKey = block?.template.key ?? "";
    const isHeaderBlock = currentTemplateKey.startsWith('header-');
    const isFooterBlock = currentTemplateKey.startsWith('footer-');
    const isGlobalHeaderOrFooter = Boolean(block) && isGlobalBlock && (isHeaderBlock || isFooterBlock);

    const replacementTemplates = useMemo(() => {
        if (!isGlobalHeaderOrFooter) {
            return [] as BlockTemplateDto[];
        }
        const prefix = isHeaderBlock ? 'header-' : 'footer-';
        return availableTemplates.filter((tpl) => tpl.key.startsWith(prefix));
    }, [availableTemplates, isGlobalHeaderOrFooter, isHeaderBlock]);

    if (!block) {
        return <p className="text-sm text-muted-foreground">Выберите блок слева, чтобы отредактировать его.</p>;
    }

    const blockHeader = (
        <div>
            <p className="text-xs uppercase tracking-wide mb-2">Шаблон</p>
            <h3 className="text-lg font-semibold text-primary mb-1">{block.template.title}</h3>
            {block.template.description ? (
                <p className="text-sm text-muted-foreground">{block.template.description}</p>
            ) : null}
        </div>
    );

    if (readOnly) {
        return (
            <div className="space-y-4">
                {blockHeader}
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    {readOnlyMessage}
                </div>
            </div>
        );
    }

    const handleSave = () => {
        const templateKey = block.template.key;
        const nextTemplateKey =
            isGlobalHeaderOrFooter && selectedTemplateKey && selectedTemplateKey !== block.template.key
                ? selectedTemplateKey
                : undefined;

        if (nextTemplateKey) {
            onSave(block.id, {
                data: draftData,
                pinned: block.pinned,
                order: block.order,
                templateKey: nextTemplateKey,
            });
            setError(null);
            return;
        }

        if (templateKey === 'header-nav-basic') {
            const logo = typeof draftData.logo === 'string' ? draftData.logo : '';
            const sticky = Boolean(draftData.sticky);

            const normalizedLinks = normalizeHeaderLinks({
                links: headerLinks,
                pages: availablePages,
            });

            if (!normalizedLinks.ok) {
                setError(normalizedLinks.error);
                return;
            }

            const normalizedActions = headerActions
                .map((item) => ({
                    label: item.label.trim() || 'Действие',
                    href: item.href.trim() || '#',
                    variant: item.variant,
                }))
                .filter((item) => Boolean(item.label));

            const nextData = {
                ...draftData,
                logo,
                sticky,
                links: normalizedLinks.links,
                actions: normalizedActions,
            } satisfies Record<string, unknown>;

            onSave(block.id, { data: nextData, pinned: isGlobalHeaderOrFooter ? block.pinned : pinned, order: isGlobalHeaderOrFooter ? block.order : order, templateKey: nextTemplateKey });
            setError(null);
            return;
        }

        if (templateKey === 'footer-contacts-basic') {
            // links управляются через header-nav-basic и синхронизируются при его сохранении,
            // но при сохранении footer мы не должны затирать уже синхронизированные ссылки
            onSave(block.id, { data: draftData, pinned: isGlobalHeaderOrFooter ? block.pinned : pinned, order: isGlobalHeaderOrFooter ? block.order : order, templateKey: nextTemplateKey });
            setError(null);
            return;
        }

        if (templateKey === 'hero-brand-highlight') {
            const nextData = { ...draftData };
            delete (nextData as Record<string, unknown>).badge;
            onSave(block.id, { data: nextData, pinned: isGlobalHeaderOrFooter ? block.pinned : pinned, order: isGlobalHeaderOrFooter ? block.order : order, templateKey: nextTemplateKey });
            setError(null);
            return;
        }

        onSave(block.id, { data: draftData, pinned: isGlobalHeaderOrFooter ? block.pinned : pinned, order: isGlobalHeaderOrFooter ? block.order : order, templateKey: nextTemplateKey });
        setError(null);
    };

    const setDraftValue = (key: string, value: unknown) => {
        setDraftData((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-5">
            {blockHeader}

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onMove(block.id, "up")}
                    disabled={!canMoveUp || isSaving || isDeleting || isGlobalHeaderOrFooter}
                >
                    <ChevronUp className="mr-2 h-4 w-4" /> Вверх
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onMove(block.id, "down")}
                    disabled={!canMoveDown || isSaving || isDeleting || isGlobalHeaderOrFooter}
                >
                    <ChevronDown className="mr-2 h-4 w-4" /> Вниз
                </Button>
            </div>


            {isGlobalHeaderOrFooter && replacementTemplates.length > 0 ? (
                <div className="space-y-2">
                    <Label className="text-sm text-primary">Шаблон (общий для всех страниц)</Label>
                    <select
                        value={selectedTemplateKey}
                        onChange={(event) => setSelectedTemplateKey(event.target.value)}
                        disabled={isSaving || isDeleting}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        {replacementTemplates.map((tpl) => (
                            <option key={tpl.id} value={tpl.key}>
                                {tpl.title}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                        Этот <span className="font-semibold text-secondary">{isHeaderBlock ? 'header' : 'footer'}</span> общий: изменения применятся ко всем страницам.
                    </p>
                </div>
            ) : null}


            <div className="space-y-2">
                {/* <Label className="flex items-center gap-2 text-sm text-secondary">
                    <input
                        type="checkbox"
                        checked={pinned}
                        onChange={(event) => setPinned(event.target.checked)}
                        className="h-4 w-4 rounded border-border"
                        disabled={isGlobalHeaderOrFooter}
                    />
                    Закреплённый блок
                </Label> */}
                <div>
                    <Label htmlFor="block-order" className="text-sm text-secondary">
                        Порядок отображения
                    </Label>
                    <input
                        id="block-order"
                        type="number"
                        value={order}
                        min={1}
                        onChange={(event) => setOrder(Number(event.target.value))}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        disabled={isGlobalHeaderOrFooter}
                    />
                </div>
            </div>

            <Separator className=" border rounded-2xl my-7" />

            <div className="space-y-3">
                <Label className="text-sm text-primary">Настройки блока</Label>

                {block.template.key === 'header-nav-basic' ? (
                    <HeaderNavEditor
                        logo={typeof draftData.logo === 'string' ? (draftData.logo as string) : ''}
                        sticky={Boolean(draftData.sticky)}
                        links={headerLinks}
                        actions={headerActions}
                        pages={availablePages}
                        onLogoChange={(value) => setDraftValue('logo', value)}
                        onStickyChange={(value) => setDraftValue('sticky', value)}
                        onLinksChange={setHeaderLinks}
                        onActionsChange={setHeaderActions}
                    />
                ) : block.template.key === 'footer-contacts-basic' ? (
                    <FooterEditor
                        data={draftData}
                        onChange={setDraftData}
                    />
                ) : (
                    <div className="space-y-4">
                        {block.template.key === 'catalog-product-grid' ? (
                            <CatalogProductGridProductsEditor
                                siteId={siteId}
                                value={Array.isArray((draftData as Record<string, unknown>).productIds)
                                    ? (((draftData as Record<string, unknown>).productIds as unknown[]) as string[])
                                    : []}
                                onChange={(next) => setDraftValue('productIds', next)}
                            />
                        ) : block.template.key === 'products-featured' ? (
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-secondary">Заголовок</Label>
                                    <Input
                                        value={typeof (draftData as Record<string, unknown>).title === 'string'
                                            ? ((draftData as Record<string, unknown>).title as string)
                                            : ''}
                                        onChange={(event) => setDraftValue('title', event.target.value)}
                                        placeholder="Например: Бестселлеры"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs text-secondary">Подзаголовок</Label>
                                    <Input
                                        value={typeof (draftData as Record<string, unknown>).subtitle === 'string'
                                            ? ((draftData as Record<string, unknown>).subtitle as string)
                                            : ''}
                                        onChange={(event) => setDraftValue('subtitle', event.target.value)}
                                        placeholder="Например: Любимые продукты наших клиентов"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs text-secondary">Цвет фона</Label>
                                    <select
                                        value={typeof (draftData as Record<string, unknown>).background === 'string'
                                            ? ((draftData as Record<string, unknown>).background as string)
                                            : 'default'}
                                        onChange={(event) => setDraftValue('background', event.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="default">Как у всех блоков</option>
                                        <option value="card">Карточка (bg-card)</option>
                                        <option value="muted">Светлый (bg-muted)</option>
                                    </select>
                                </div>

                                <ProductsFeaturedProductsEditor
                                    siteId={siteId}
                                    value={Array.isArray((draftData as Record<string, unknown>).productIds)
                                        ? (((draftData as Record<string, unknown>).productIds as unknown[]) as string[])
                                        : []}
                                    onChange={(next) => setDraftValue('productIds', next)}
                                />
                            </div>
                        ) : (
                            <>
                                {block.template.key === 'catalog-search-filter' ? (
                                    <CatalogSearchFilterCategoriesEditor
                                        siteId={siteId}
                                        value={Array.isArray((draftData as Record<string, unknown>).featuredCategories)
                                            ? (((draftData as Record<string, unknown>).featuredCategories as unknown[]) as string[])
                                            : []}
                                        onChange={(next) => setDraftValue('featuredCategories', next)}
                                    />
                                ) : null}

                                <GenericBlockDataEditor
                                    data={draftData}
                                    onChange={setDraftData}
                                    templateKey={block.template.key}
                                />
                            </>
                        )}
                    </div>
                )}

                {error ? <p className="text-xs text-destructive">{error}</p> : null}
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Сохраняем..." : "Сохранить"}
                </Button>
                <Button
                    variant={'destructive'}
                    onClick={() => onDelete(block.id)}
                    disabled={isDeleting || isGlobalHeaderOrFooter}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isGlobalHeaderOrFooter ? "Нельзя удалить" : isDeleting ? "Удаляем..." : "Удалить"}
                </Button>
            </div>
        </div>
    );
}
function createEntryId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getPageHref(page: PageDto) {
    if (page.type === 'HOME') {
        return '/';
    }
    return `/${page.slug}`;
}

function resolvePageIdFromHref(pages: PageDto[], href: string): string | null {
    const normalized = (href || '').trim();
    if (!normalized) {
        return null;
    }
    const match = pages.find((page) => getPageHref(page) === normalized);
    return match?.id ?? null;
}

function normalizeHeaderLinks({
    links,
    pages,
}: {
    links: Array<{ label: string; pageId: string }>;
    pages: PageDto[];
}): { ok: true; links: Array<{ label: string; href: string; pageId: string }> } | { ok: false; error: string } {
    const cleaned = links
        .map((item) => ({
            label: item.label.trim(),
            pageId: item.pageId.trim(),
        }))
        .filter((item) => item.label || item.pageId);

    for (const item of cleaned) {
        if (!item.label) {
            return { ok: false, error: 'Заполните название пункта меню.' };
        }
        if (!item.pageId) {
            return { ok: false, error: `Для пункта "${item.label}" выберите страницу.` };
        }
    }

    const duplicates = findDuplicates(cleaned.map((item) => item.pageId));
    if (duplicates.length > 0) {
        return { ok: false, error: 'Одна и та же страница не может быть добавлена в меню дважды.' };
    }

    const resolved = cleaned.map((item) => {
        const page = pages.find((p) => p.id === item.pageId);
        if (!page) {
            return null;
        }
        return {
            label: item.label,
            href: getPageHref(page),
            pageId: item.pageId,
        };
    });

    if (resolved.some((item) => item === null)) {
        return { ok: false, error: 'Некоторые выбранные страницы больше недоступны. Обновите список.' };
    }

    return { ok: true, links: resolved as Array<{ label: string; href: string; pageId: string }> };
}

function findDuplicates(values: string[]): string[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const value of values) {
        if (seen.has(value)) {
            duplicates.add(value);
        }
        seen.add(value);
    }
    return Array.from(duplicates);
}

function GenericBlockDataEditor({
    data,
    onChange,
    templateKey,
}: {
    data: Record<string, unknown>;
    onChange: (next: Record<string, unknown>) => void;
    templateKey?: string;
}) {
    const handlePrimitiveChange = (key: string, value: unknown) => {
        onChange({ ...data, [key]: value });
    };

    const keys = Object.keys(data).filter((key) => {
        if (templateKey === 'products-featured' && key === 'productIds') {
            return false;
        }
        if (templateKey === 'catalog-product-grid' && key === 'productIds') {
            return false;
        }
        if (templateKey === 'products-featured' && (key === 'layout' || key === 'maxItems')) {
            return false;
        }
        if (templateKey === 'catalog-search-filter' && key === 'featuredCategories') {
            return false;
        }
        if (templateKey === 'hero-brand-highlight' && key === 'badge') {
            return false;
        }
        return true;
    });

    if (keys.length === 0) {
        return <p className="text-xs text-muted-foreground">У этого блока нет редактируемых полей.</p>;
    }

    return (
        <div className="space-y-3">
            {keys.map((key) => (
                <DataField
                    key={key}
                    label={key}
                    value={data[key]}
                    onChange={(value) => handlePrimitiveChange(key, value)}
                />
            ))}
        </div>
    );
}

function DataField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: unknown;
    onChange: (value: unknown) => void;
}) {
    if (Array.isArray(value)) {
        return (
            <ArrayField
                label={label}
                value={value}
                onChange={onChange}
            />
        );
    }

    if (isPlainObject(value)) {
        return (
            <ObjectField
                label={label}
                value={value}
                onChange={(next) => onChange(next)}
            />
        );
    }

    if (typeof value === 'boolean') {
        return (
            <Label className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm">
                <span className="font-medium text-secondary">{label}</span>
                <input
                    type="checkbox"
                    checked={value}
                    onChange={(event) => onChange(event.target.checked)}
                    className="h-4 w-4 rounded border-border"
                />
            </Label>
        );
    }

    if (typeof value === 'number') {
        return (
            <div className="space-y-1">
                <Label className="text-xs text-secondary">{label}</Label>
                <Input
                    type="number"
                    value={Number.isFinite(value) ? value : 0}
                    onChange={(event) => onChange(Number(event.target.value))}
                />
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <Label className="text-xs text-secondary">{label}</Label>
            <Input
                value={typeof value === 'string' ? value : value == null ? '' : String(value)}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}

function ObjectField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: Record<string, unknown>;
    onChange: (next: Record<string, unknown>) => void;
}) {
    const keys = Object.keys(value);
    return (
        <div className="rounded-lg border border-border p-3">
            <p className="text-sm font-medium text-primary">{label}</p>
            <div className="mt-3 space-y-3">
                {keys.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Нет полей.</p>
                ) : (
                    keys.map((key) => (
                        <DataField
                            key={key}
                            label={key}
                            value={value[key]}
                            onChange={(nextValue) => onChange({ ...value, [key]: nextValue })}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function ArrayField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: unknown[];
    onChange: (next: unknown) => void;
}) {
    const isObjects = value.some((item) => isPlainObject(item));
    const canAdd = true;

    const handleRemove = (index: number) => {
        const next = value.filter((_, i) => i !== index);
        onChange(next);
    };

    const handleAdd = () => {
        const sample = value.find((item) => item != null) ?? (isObjects ? {} : '');
        if (isPlainObject(sample)) {
            const keys = Object.keys(sample);
            const nextItem: Record<string, unknown> = {};
            for (const key of keys) {
                nextItem[key] = '';
            }
            onChange([...value, nextItem]);
            return;
        }
        onChange([...value, '']);
    };

    return (
        <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-primary">{label}</p>
                {canAdd ? (
                    <Button type="button" size="sm" variant="outline" onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Добавить
                    </Button>
                ) : null}
            </div>
            <div className="mt-3 space-y-3">
                {value.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Список пуст.</p>
                ) : (
                    value.map((item, index) => (
                        <div key={index} className="rounded-lg border border-border p-3">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-xs text-secondary">Элемент {index + 1}</p>
                                <Button type="button" size="icon" variant="ghost" onClick={() => handleRemove(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="mt-2">
                                {isPlainObject(item) ? (
                                    <ObjectField
                                        label=""
                                        value={item}
                                        onChange={(nextObject) => {
                                            const next = [...value];
                                            next[index] = nextObject;
                                            onChange(next);
                                        }}
                                    />
                                ) : (
                                    <Input
                                        value={typeof item === 'string' ? item : item == null ? '' : String(item)}
                                        onChange={(event) => {
                                            const next = [...value];
                                            next[index] = event.target.value;
                                            onChange(next);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function CatalogSearchFilterCategoriesEditor({
    siteId,
    value,
    onChange,
}: {
    siteId: string;
    value: string[];
    onChange: (next: string[]) => void;
}) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const { data: categories = [], isLoading } = useQuery({
        queryKey: queryKeys.siteCategories(siteId),
        queryFn: () => CategoriesApi.list(siteId),
        staleTime: 60 * 1000,
    });

    const normalizedSelectedIds = useMemo(() => {
        const raw = Array.isArray(value) ? value : [];
        const set = new Set<string>();

        for (const item of raw) {
            if (typeof item !== 'string' || !item) continue;

            // Поддержка старого формата, где могли сохраняться name/slug.
            const byId = categories.find((c) => c.id === item);
            if (byId) {
                set.add(byId.id);
                continue;
            }
            const bySlug = categories.find((c) => c.slug === item);
            if (bySlug) {
                set.add(bySlug.id);
                continue;
            }
            const byName = categories.find((c) => c.name === item);
            if (byName) {
                set.add(byName.id);
                continue;
            }
        }

        return Array.from(set);
    }, [value, categories]);

    const selectedSet = useMemo(() => new Set(normalizedSelectedIds), [normalizedSelectedIds]);

    const selectedNamesSummary = useMemo(() => {
        const selectedNames = normalizedSelectedIds
            .map((id) => categories.find((c) => c.id === id)?.name)
            .filter((name): name is string => Boolean(name));

        if (selectedNames.length === 0) return 'Выбрать категории';
        if (selectedNames.length <= 2) return selectedNames.join(', ');
        return `${selectedNames.slice(0, 2).join(', ')} +${selectedNames.length - 2}`;
    }, [normalizedSelectedIds, categories]);

    const filteredCategories = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return categories;
        return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
    }, [categories, search]);

    const toggle = (categoryId: string) => {
        const next = new Set(selectedSet);
        if (next.has(categoryId)) {
            next.delete(categoryId);
        } else {
            next.add(categoryId);
        }
        onChange(Array.from(next));
    };

    return (
        <div className="rounded-lg border border-border p-3 space-y-3">
            <div>
                <p className="text-sm font-medium text-primary">Категории</p>
                <p className="text-xs text-muted-foreground">
                    Выберите несколько категорий, по которым будут фильтроваться товары.
                </p>
            </div>

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-between">
                        <span className="truncate">{selectedNamesSummary}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{normalizedSelectedIds.length}</span>
                    </Button>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-80 p-3">
                    <div className="space-y-2">
                        <div className="space-y-2">
                            <Label className="text-xs text-secondary">Поиск</Label>
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={isLoading ? 'Загрузка категорий...' : 'Начните вводить название'}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border border-border p-2">
                            {isLoading ? (
                                <p className="text-xs text-muted-foreground">Загрузка...</p>
                            ) : filteredCategories.length === 0 ? (
                                <p className="text-xs text-muted-foreground">Ничего не найдено.</p>
                            ) : (
                                filteredCategories.map((cat) => {
                                    const checked = selectedSet.has(cat.id);
                                    return (
                                        <label
                                            key={cat.id}
                                            className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1 hover:bg-muted/40"
                                        >
                                            <span className="text-sm text-secondary">{cat.name}</span>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggle(cat.id)}
                                                className="h-4 w-4 rounded border-border"
                                            />
                                        </label>
                                    );
                                })
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button type="button" size="sm" variant="outline" onClick={() => setIsOpen(false)}>
                                Готово
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

function CatalogProductGridProductsEditor({
    siteId,
    value,
    onChange,
}: {
    siteId: string;
    value: string[];
    onChange: (next: string[]) => void;
}) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const normalizedSelectedIds = useMemo(() => {
        const raw = Array.isArray(value) ? value : [];
        return raw.filter((item): item is string => typeof item === 'string' && Boolean(item));
    }, [value]);

    const selectedSet = useMemo(() => new Set(normalizedSelectedIds), [normalizedSelectedIds]);

    const activeSearch = search.trim() ? search.trim() : undefined;

    const { data: productsPage, isLoading } = useQuery({
        queryKey: queryKeys.siteProductsList(siteId, 1, activeSearch, 30),
        queryFn: () => ProductsApi.list(siteId, { page: 1, limit: 30, search: activeSearch }),
        staleTime: 30 * 1000,
    });

    const products = productsPage?.data ?? [];

    const summary = normalizedSelectedIds.length
        ? `Выбрано: ${normalizedSelectedIds.length}`
        : 'Выбрать товары';

    const toggle = (productId: string) => {
        const next = new Set(normalizedSelectedIds);
        if (next.has(productId)) {
            next.delete(productId);
        } else {
            next.add(productId);
        }
        onChange(Array.from(next));
    };

    const renderLine = (product: ProductDto) => {
        const checked = selectedSet.has(product.id);
        const price = Number(product.price);
        const currency = product.currency ?? '';
        const priceLabel = Number.isFinite(price)
            ? `${price.toLocaleString('ru-RU')} ${currency}`.trim()
            : '';

        return (
            <label
                key={product.id}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1 hover:bg-muted/40"
            >
                <div className="min-w-0">
                    <p className="text-sm text-secondary truncate">{product.title}</p>
                    {priceLabel ? (
                        <p className="text-xs text-muted-foreground truncate">{priceLabel}</p>
                    ) : null}
                </div>

                <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(product.id)}
                    className="h-4 w-4 rounded border-border"
                />
            </label>
        );
    };

    return (
        <div className="rounded-lg border border-border p-3 space-y-3">
            <div>
                <p className="text-sm font-medium text-primary">Товары</p>
                <p className="text-xs text-muted-foreground">
                    Если выбрать товары здесь, блок будет показывать только выбранные карточки.
                </p>
            </div>

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-between">
                        <span className="truncate">{summary}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{normalizedSelectedIds.length}</span>
                    </Button>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-96 p-3">
                    <div className="space-y-2">
                        <div className="space-y-2">
                            <Label className="text-xs text-secondary">Поиск</Label>
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={isLoading ? 'Загрузка товаров...' : 'Начните вводить название'}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                            {isLoading ? (
                                <p className="text-xs text-muted-foreground">Загрузка...</p>
                            ) : products.length === 0 ? (
                                <p className="text-xs text-muted-foreground">Ничего не найдено.</p>
                            ) : (
                                products.map(renderLine)
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => onChange([])}
                                disabled={normalizedSelectedIds.length === 0}
                            >
                                Очистить
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => setIsOpen(false)}>
                                Готово
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

function ProductsFeaturedProductsEditor({
    siteId,
    value,
    onChange,
}: {
    siteId: string;
    value: string[];
    onChange: (next: string[]) => void;
}) {
    const MAX_FEATURED = 4;
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const normalizedSelectedIds = useMemo(() => {
        const raw = Array.isArray(value) ? value : [];
        return raw
            .filter((item): item is string => typeof item === 'string' && Boolean(item))
            .slice(0, MAX_FEATURED);
    }, [value]);

    const selectedSet = useMemo(() => new Set(normalizedSelectedIds), [normalizedSelectedIds]);
    const activeSearch = search.trim() ? search.trim() : undefined;

    const { data: productsPage, isLoading } = useQuery({
        queryKey: queryKeys.siteProductsList(siteId, 1, activeSearch, 30),
        queryFn: () => ProductsApi.list(siteId, { page: 1, limit: 30, search: activeSearch }),
        staleTime: 30 * 1000,
    });

    const products = productsPage?.data ?? [];

    const summary = normalizedSelectedIds.length
        ? `Выбрано: ${normalizedSelectedIds.length}`
        : 'Выбрать товары';

    const toggle = (productId: string) => {
        const next = new Set(normalizedSelectedIds);
        if (next.has(productId)) {
            next.delete(productId);
            onChange(Array.from(next));
            return;
        }

        if (next.size >= MAX_FEATURED) {
            return;
        }

        next.add(productId);
        onChange(Array.from(next));
    };

    const renderLine = (product: ProductDto) => {
        const checked = selectedSet.has(product.id);
        const price = Number(product.price);
        const currency = product.currency ?? '';
        const priceLabel = Number.isFinite(price)
            ? `${price.toLocaleString('ru-RU')} ${currency}`.trim()
            : '';

        const disableAdd = !checked && normalizedSelectedIds.length >= MAX_FEATURED;

        return (
            <label
                key={product.id}
                className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1",
                    disableAdd ? "opacity-50" : "hover:bg-muted/40",
                )}
            >
                <div className="min-w-0">
                    <p className="text-sm text-secondary truncate">{product.title}</p>
                    {priceLabel ? (
                        <p className="text-xs text-muted-foreground truncate">{priceLabel}</p>
                    ) : null}
                </div>

                <input
                    type="checkbox"
                    checked={checked}
                    disabled={disableAdd}
                    onChange={() => toggle(product.id)}
                    className="h-4 w-4 rounded border-border"
                />
            </label>
        );
    };

    return (
        <div className="rounded-lg border border-border p-3 space-y-3">
            <div>
                <p className="text-sm font-medium text-primary">Товары</p>
                <p className="text-xs text-muted-foreground">Выберите до {MAX_FEATURED} товаров для витрины.</p>
            </div>

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-between">
                        <span className="truncate">{summary}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{normalizedSelectedIds.length}</span>
                    </Button>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-96 p-3">
                    <div className="space-y-2">
                        <div className="space-y-2">
                            <Label className="text-xs text-secondary">Поиск</Label>
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={isLoading ? 'Загрузка товаров...' : 'Начните вводить название'}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                            {isLoading ? (
                                <p className="text-xs text-muted-foreground">Загрузка...</p>
                            ) : products.length === 0 ? (
                                <p className="text-xs text-muted-foreground">Ничего не найдено.</p>
                            ) : (
                                products.map(renderLine)
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => onChange([])}
                                disabled={normalizedSelectedIds.length === 0}
                            >
                                Очистить
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => setIsOpen(false)}>
                                Готово
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

function HeaderNavEditor({
    logo,
    sticky,
    links,
    actions,
    pages,
    onLogoChange,
    onStickyChange,
    onLinksChange,
    onActionsChange,
}: {
    logo: string;
    sticky: boolean;
    links: Array<{ id: string; label: string; pageId: string }>;
    actions: Array<{ id: string; label: string; href: string; variant?: string }>;
    pages: PageDto[];
    onLogoChange: (value: string) => void;
    onStickyChange: (value: boolean) => void;
    onLinksChange: (next: Array<{ id: string; label: string; pageId: string }>) => void;
    onActionsChange: (next: Array<{ id: string; label: string; href: string; variant?: string }>) => void;
}) {
    const selectablePages = pages.filter((page) => page.isVisible);

    const usedPageIds = new Set(links.map((item) => item.pageId).filter(Boolean));

    const addLink = () => {
        onLinksChange([...links, { id: createEntryId(), label: '', pageId: '' }]);
    };

    const removeLink = (id: string) => {
        onLinksChange(links.filter((item) => item.id !== id));
    };

    const updateLink = (id: string, patch: Partial<{ label: string; pageId: string }>) => {
        onLinksChange(links.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    };

    const addAction = () => {
        onActionsChange([...actions, { id: createEntryId(), label: '', href: '' }]);
    };

    const removeAction = (id: string) => {
        onActionsChange(actions.filter((item) => item.id !== id));
    };

    const updateAction = (id: string, patch: Partial<{ label: string; href: string; variant?: string }>) => {
        onActionsChange(actions.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <Label className="text-xs text-secondary">Логотип (текст)</Label>
                <Input value={logo} onChange={(event) => onLogoChange(event.target.value)} placeholder="Название" />
            </div>

            <Label className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm">
                <span className="font-medium">Закрепить (sticky)</span>
                <input
                    type="checkbox"
                    checked={sticky}
                    onChange={(event) => onStickyChange(event.target.checked)}
                    className="h-4 w-4 rounded border-border"
                />
            </Label>

            <div className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-primary">Меню навигации</p>
                    <Button type="button" size="sm" variant="outline" onClick={addLink}>
                        <Plus className="mr-2 h-4 w-4" /> Добавить пункт
                    </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    Пункты меню привязываются только к существующим страницам сайта. Одну страницу нельзя добавить дважды.
                </p>

                <div className="mt-3 space-y-3">
                    {links.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Пока нет пунктов меню.</p>
                    ) : (
                        links.map((link) => {
                            const otherUsed = new Set(Array.from(usedPageIds));
                            if (link.pageId) {
                                otherUsed.delete(link.pageId);
                            }
                            const options = selectablePages.filter((p) => !otherUsed.has(p.id));

                            return (
                                <div key={link.id} className="rounded-lg border border-border p-3 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs text-secondary">Пункт меню</p>
                                        <Button type="button" size="icon" variant="ghost" onClick={() => removeLink(link.id)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="grid gap-2">
                                        <Input
                                            value={link.label}
                                            onChange={(event) => updateLink(link.id, { label: event.target.value })}
                                            placeholder="Название (например, Каталог)"
                                        />

                                        <select
                                            value={link.pageId}
                                            onChange={(event) => updateLink(link.id, { pageId: event.target.value })}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="">Выберите страницу</option>
                                            {options.map((page) => (
                                                <option key={page.id} value={page.id}>
                                                    {page.title} (/{page.slug})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-primary">Кнопки действий</p>
                    <Button type="button" size="sm" variant="outline" onClick={addAction}>
                        <Plus className="mr-2 h-4 w-4" /> Добавить кнопку
                    </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    Для кнопок действий пока используется прямой URL (например, /auth).
                </p>

                <div className="mt-3 space-y-3">
                    {actions.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Кнопок действий нет.</p>
                    ) : (
                        actions.map((action) => (
                            <div key={action.id} className="rounded-lg border border-border p-3 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs text-secondary">Кнопка</p>
                                    <Button type="button" size="icon" variant="ghost" onClick={() => removeAction(action.id)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Input
                                    value={action.label}
                                    onChange={(event) => updateAction(action.id, { label: event.target.value })}
                                    placeholder="Текст кнопки"
                                />
                                <Input
                                    value={action.href}
                                    onChange={(event) => updateAction(action.id, { href: event.target.value })}
                                    placeholder="Ссылка (href)"
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function FooterEditor({
    data,
    onChange,
}: {
    data: Record<string, unknown>;
    onChange: (next: Record<string, unknown>) => void;
}) {
    const contacts = Array.isArray(data.contacts) ? (data.contacts as any[]) : [];

    const setField = (key: string, value: unknown) => onChange({ ...data, [key]: value });

    const updateContact = (index: number, patch: Partial<{ type: string; value: string }>) => {
        const next = contacts.map((item, i) => (i === index ? { ...item, ...patch } : item));
        setField('contacts', next);
    };

    const addContact = () => {
        setField('contacts', [...contacts, { type: 'email', value: '' }]);
    };

    const removeContact = (index: number) => {
        setField('contacts', contacts.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                Название (бренд) и ссылки в футере синхронизируются из блока Header (header-nav-basic).
            </div>

            <div className="space-y-1">
                <Label className="text-xs text-secondary">Бренд</Label>
                <Input
                    value={typeof data.brand === 'string' ? (data.brand as string) : ''}
                    onChange={(event) => setField('brand', event.target.value)}
                    disabled
                />
            </div>

            <div className="space-y-1">
                <Label className="text-xs text-secondary">Описание</Label>
                <Input
                    value={typeof data.description === 'string' ? (data.description as string) : ''}
                    onChange={(event) => setField('description', event.target.value)}
                />
            </div>

            <div className="space-y-1">
                <Label className="text-xs text-secondary">Юридическая строка</Label>
                <Input
                    value={typeof data.legal === 'string' ? (data.legal as string) : ''}
                    onChange={(event) => setField('legal', event.target.value)}
                />
            </div>

            <div className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">Контакты</p>
                    <Button type="button" size="sm" variant="outline" onClick={addContact}>
                        <Plus className="mr-2 h-4 w-4" /> Добавить
                    </Button>
                </div>
                <div className="mt-3 space-y-3">
                    {contacts.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Контактов нет.</p>
                    ) : (
                        contacts.map((contact, index) => (
                            <div key={index} className="rounded-lg border border-border p-3 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs text-muted-foreground">Контакт</p>
                                    <Button type="button" size="icon" variant="ghost" onClick={() => removeContact(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <Input
                                    value={typeof contact?.type === 'string' ? contact.type : ''}
                                    onChange={(event) => updateContact(index, { type: event.target.value })}
                                    placeholder="Тип (email/telegram/phone)"
                                />
                                <Input
                                    value={typeof contact?.value === 'string' ? contact.value : ''}
                                    onChange={(event) => updateContact(index, { value: event.target.value })}
                                    placeholder="Значение"
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
