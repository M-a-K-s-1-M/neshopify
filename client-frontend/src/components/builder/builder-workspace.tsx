'use client'

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
} from "@/components";
import { cn } from "@/lib/utils";
import { useSiteQuery, useSitePagesQuery, usePageDetailQuery, useBlockTemplatesQuery } from "@/lib/query/hooks";
import { SitePageView } from "./site-page-view";
import type { BlockInstanceDto, BlockTemplateDto, CreateBlockPayload, UpdateBlockPayload } from "@/lib/types";
import { getPresetsByTemplate } from "./block-presets";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { PageBlocksApi } from "@/lib/api/page-blocks";
import { queryKeys } from "@/lib/query/keys";

interface BuilderWorkspaceProps {
    siteId: string;
    pageSlug: string;
}

export function BuilderWorkspace({ siteId, pageSlug }: BuilderWorkspaceProps) {
    const queryClient = useQueryClient();
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [activeTemplateKey, setActiveTemplateKey] = useState<string | null>(null);

    const { data: site, isLoading: siteLoading, error: siteError } = useSiteQuery(siteId);
    const { data: pages, isLoading: pagesLoading, error: pagesError } = useSitePagesQuery(siteId);

    const currentPage = useMemo(() => pages?.find((page) => page.slug === pageSlug), [pages, pageSlug]);
    const pageId = currentPage?.id;

    const {
        data: pageDetail,
        isLoading: pageLoading,
        error: pageError,
    } = usePageDetailQuery(siteId, pageId);

    const { data: templates, isLoading: templatesLoading } = useBlockTemplatesQuery();

    useEffect(() => {
        if (!activeTemplateKey && templates && templates.length > 0) {
            setActiveTemplateKey(templates[0].key);
        }
    }, [templates, activeTemplateKey]);

    const blocks = useMemo(() => {
        if (!pageDetail?.blocks) {
            return [] as BlockInstanceDto[];
        }
        return [...pageDetail.blocks].sort((a, b) => a.order - b.order);
    }, [pageDetail?.blocks]);

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
    const activeTemplate = templates?.find((tpl) => tpl.key === activeTemplateKey) ?? templates?.[0] ?? null;

    const errorMessage = siteError
        ? getRequestErrorMessage(siteError, "Не удалось загрузить сайт")
        : pagesError
            ? getRequestErrorMessage(pagesError, "Не удалось загрузить страницы")
            : pageError
                ? getRequestErrorMessage(pageError, "Не удалось загрузить страницу")
                : null;

    const isLoading = siteLoading || pagesLoading || pageLoading;

    const invalidatePage = async () => {
        if (!pageId) return;
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.page(siteId, pageId) }),
            queryClient.invalidateQueries({ queryKey: queryKeys.pageBlocks(siteId, pageId) }),
        ]);
    };

    const createBlockMutation = useMutation({
        mutationFn: (payload: CreateBlockPayload) => PageBlocksApi.create(siteId, pageId as string, payload),
        onSuccess: async (block) => {
            await invalidatePage();
            setSelectedBlockId(block.id);
            setIsLibraryOpen(false);
        },
        onError: (error) => {
            window.alert(getRequestErrorMessage(error, "Не удалось добавить блок"));
        },
    });

    const updateBlockMutation = useMutation({
        mutationFn: (params: { blockId: string; payload: UpdateBlockPayload }) =>
            PageBlocksApi.update(siteId, pageId as string, params.blockId, params.payload),
        onSuccess: async () => {
            await invalidatePage();
        },
        onError: (error) => {
            window.alert(getRequestErrorMessage(error, "Не удалось сохранить блок"));
        },
    });

    const deleteBlockMutation = useMutation({
        mutationFn: (blockId: string) => PageBlocksApi.remove(siteId, pageId as string, blockId),
        onSuccess: async () => {
            await invalidatePage();
            setSelectedBlockId(null);
        },
        onError: (error) => {
            window.alert(getRequestErrorMessage(error, "Не удалось удалить блок"));
        },
    });

    const handleAddPreset = (template: BlockTemplateDto, presetData: Record<string, unknown>) => {
        if (!pageId) return;
        const nextOrder = blocks.length > 0 ? blocks[blocks.length - 1].order + 1 : 1;
        createBlockMutation.mutate({
            templateKey: template.key,
            data: presetData,
            order: nextOrder,
        });
    };

    const handleSaveBlock = (blockId: string, payload: UpdateBlockPayload) => {
        updateBlockMutation.mutate({ blockId, payload });
    };

    const handleDeleteBlock = (blockId: string) => {
        if (!window.confirm("Удалить блок?")) {
            return;
        }
        deleteBlockMutation.mutate(blockId);
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
                            <Button className="w-full" variant={'secondary'} disabled={templatesLoading || !templates}>
                                <Plus className="mr-2 h-4 w-4" /> Добавить блок
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent className="p-0">
                            <DrawerHeader className="text-left">
                                <DrawerTitle>Добавить блок</DrawerTitle>
                                <DrawerDescription>Выберите шаблон и вариант блока.</DrawerDescription>
                            </DrawerHeader>
                            <div className="grid gap-4 border-t border-border p-4 md:grid-cols-[220px_minmax(0,1fr)]">
                                <div className="space-y-2">
                                    {templates?.map((template) => (
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
                                    {!templates || templates.length === 0 ? (
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
                                                onSelect={(data) => handleAddPreset(activeTemplate, data)}
                                                isSubmitting={createBlockMutation.isPending}
                                            />
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Выберите шаблон слева.</p>
                                    )}
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

                <section className="rounded-2xl border border-border bg-background p-4">
                    <SitePageView slug={pageSlug} title={currentPage?.title} description={currentPage?.seo?.description as string | undefined} />
                </section>

                <aside className="rounded-2xl border border-border bg-card p-4">
                    <BlockEditorPanel
                        block={selectedBlock}
                        onSave={handleSaveBlock}
                        onDelete={handleDeleteBlock}
                        isSaving={updateBlockMutation.isPending}
                        isDeleting={deleteBlockMutation.isPending}
                    />
                </aside>
            </div>
        </div>
    );
}

function PresetGrid({
    template,
    onSelect,
    isSubmitting,
}: {
    template: BlockTemplateDto;
    onSelect: (data: Record<string, unknown>) => void;
    isSubmitting: boolean;
}) {
    const presets = getPresetsByTemplate(template.key);

    if (presets.length === 0) {
        return <p className="text-sm text-muted-foreground">Для шаблона пока нет пресетов.</p>;
    }

    return (
        <div className="space-y-3">
            {presets.map((preset) => (
                <div key={preset.id} className="rounded-xl border border-border p-4">
                    <p className="text-sm font-medium">{preset.name}</p>
                    {preset.description ? (
                        <p className="text-xs text-muted-foreground">{preset.description}</p>
                    ) : null}
                    <Button
                        className="mt-3"
                        size={'sm'}
                        disabled={isSubmitting}
                        onClick={() => onSelect(preset.data)}
                    >
                        {isSubmitting ? "Добавляем..." : "Использовать"}
                    </Button>
                </div>
            ))}
        </div>
    );
}

function BlockEditorPanel({
    block,
    onSave,
    onDelete,
    isSaving,
    isDeleting,
}: {
    block: BlockInstanceDto | null;
    onSave: (blockId: string, payload: UpdateBlockPayload) => void;
    onDelete: (blockId: string) => void;
    isSaving: boolean;
    isDeleting: boolean;
}) {
    const [pinned, setPinned] = useState(false);
    const [order, setOrder] = useState(1);
    const [dataDraft, setDataDraft] = useState("{}");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!block) {
            setPinned(false);
            setOrder(1);
            setDataDraft("{}");
            setError(null);
            return;
        }
        setPinned(block.pinned);
        setOrder(block.order);
        setDataDraft(JSON.stringify(block.data ?? {}, null, 2));
        setError(null);
    }, [block]);

    if (!block) {
        return <p className="text-sm text-muted-foreground">Выберите блок слева, чтобы отредактировать его.</p>;
    }

    const handleSave = () => {
        try {
            const parsed = JSON.parse(dataDraft);
            onSave(block.id, { data: parsed, pinned, order });
            setError(null);
        } catch (err) {
            setError("Некорректный JSON. Проверьте синтаксис.");
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Шаблон</p>
                <h3 className="text-lg font-semibold">{block.template.title}</h3>
                {block.template.description ? (
                    <p className="text-sm text-muted-foreground">{block.template.description}</p>
                ) : null}
            </div>

            <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={pinned}
                        onChange={(event) => setPinned(event.target.checked)}
                        className="h-4 w-4 rounded border-border"
                    />
                    Закреплённый блок
                </Label>
                <div>
                    <Label htmlFor="block-order" className="text-sm">
                        Порядок отображения
                    </Label>
                    <input
                        id="block-order"
                        type="number"
                        value={order}
                        min={1}
                        onChange={(event) => setOrder(Number(event.target.value))}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="block-json" className="text-sm">
                    Данные блока (JSON)
                </Label>
                <textarea
                    id="block-json"
                    value={dataDraft}
                    onChange={(event) => setDataDraft(event.target.value)}
                    rows={12}
                    className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
                />
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
                    disabled={isDeleting}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? "Удаляем..." : "Удалить"}
                </Button>
            </div>
        </div>
    );
}
