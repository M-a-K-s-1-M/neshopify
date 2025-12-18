'use client';

import { useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerTrigger,
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components";
import { PagesApi } from "@/lib/api/pages";
import { queryKeys } from "@/lib/query/keys";
import type { CreatePagePayload, PageType } from "@/lib/types";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { useMediaQuery } from "@/hooks/use-media-query";
import { INTERNAL_LAYOUT_PAGE_SLUG } from "@/components/builder/default-page-blocks";

interface AddPageBtnProps {
    siteId: string;
}

interface CreatePageFormValues {
    title: string;
    slug: string;
    type: PageType;
}

export function AddPageBtn({ siteId }: AddPageBtnProps) {
    const [open, setOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const trigger = (
        <Button variant={'outline'} className="cursor-pointer shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Добавить страницу
        </Button>
    );

    const form = (
        <CreatePageForm
            siteId={siteId}
            onSuccess={() => setOpen(false)}
        />
    );

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Новая страница</DialogTitle>
                    </DialogHeader>
                    {form}
                    <DialogFooter>
                        <Button form="create-page-form" type="submit">
                            Создать
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{trigger}</DrawerTrigger>
            <DrawerContent className="p-4">
                <DialogHeader className="mt-2 text-center">
                    <DialogTitle>Новая страница</DialogTitle>
                </DialogHeader>
                <div className="p-4">{form}</div>
                <DrawerFooter>
                    <Button form="create-page-form" type="submit">
                        Создать
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Отмена</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

function CreatePageForm({ siteId, onSuccess }: { siteId: string; onSuccess: () => void }) {
    const queryClient = useQueryClient();
    const slugEditedRef = useRef(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<CreatePageFormValues>({
        mode: "onSubmit",
        defaultValues: {
            title: "",
            slug: "",
            type: "CUSTOM",
        },
    });

    const titleValue = form.watch("title");

    useEffect(() => {
        if (slugEditedRef.current) {
            return;
        }
        const nextSlug = slugify(titleValue ?? "");
        form.setValue("slug", nextSlug, { shouldValidate: form.formState.isSubmitted });
    }, [form, titleValue]);

    const createMutation = useMutation({
        mutationFn: (payload: CreatePagePayload) => PagesApi.create(siteId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.sitePages(siteId) });
            setSubmitError(null);
            slugEditedRef.current = false;
            form.reset({ title: "", slug: "", type: "CUSTOM" });
            onSuccess();
        },
        onError: (error) => {
            setSubmitError(getRequestErrorMessage(error, "Не удалось создать страницу"));
        },
    });

    const onSubmit: SubmitHandler<CreatePageFormValues> = async (values) => {
        setSubmitError(null);
        slugEditedRef.current = values.slug.trim().length > 0;
        await createMutation.mutateAsync({
            title: values.title.trim(),
            slug: values.slug.trim(),
            type: values.type,
        });
    };

    return (
        <form id="create-page-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldSet>
                <FieldGroup>
                    <Controller
                        name="title"
                        control={form.control}
                        rules={{
                            required: "Название обязательно",
                            minLength: { value: 3, message: "Минимум 3 символа" },
                        }}
                        render={({ field, fieldState }) => (
                            <Field className="gap-2">
                                <FieldLabel htmlFor="pageTitle">Название</FieldLabel>
                                <Input
                                    {...field}
                                    id="pageTitle"
                                    placeholder="Новая страница"
                                    autoComplete="off"
                                    aria-invalid={fieldState.invalid}
                                    disabled={createMutation.isPending}
                                />
                                {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                            </Field>
                        )}
                    />

                    <Controller
                        name="slug"
                        control={form.control}
                        rules={{
                            required: "Slug обязателен",
                            pattern: {
                                value: /^[a-z0-9-]+$/,
                                message: "Только строчные буквы, цифры и дефисы",
                            },
                            validate: (value) =>
                                value !== INTERNAL_LAYOUT_PAGE_SLUG || "Этот slug зарезервирован системой",
                        }}
                        render={({ field, fieldState }) => (
                            <Field className="gap-2">
                                <FieldLabel htmlFor="pageSlug">Slug</FieldLabel>
                                <Input
                                    {...field}
                                    id="pageSlug"
                                    placeholder="landing"
                                    autoComplete="off"
                                    aria-invalid={fieldState.invalid}
                                    disabled={createMutation.isPending}
                                    onChange={(event) => {
                                        const value = event.target.value.toLowerCase();
                                        slugEditedRef.current = value.trim().length > 0;
                                        field.onChange(value.replace(/[^a-z0-9-]/g, ""));
                                    }}
                                />
                                {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                            </Field>
                        )}
                    />

                    <Controller
                        name="type"
                        control={form.control}
                        render={({ field }) => (
                            <Field className="gap-2">
                                <FieldLabel htmlFor="pageType">Тип страницы</FieldLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={(value) => field.onChange(value as PageType)}
                                    disabled={createMutation.isPending}
                                >
                                    <SelectTrigger id="pageType" className="w-full">
                                        <SelectValue placeholder="Выберите тип" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAGE_TYPE_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                    />
                </FieldGroup>
            </FieldSet>

            {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
        </form>
    );
}

const PAGE_TYPE_OPTIONS: { value: PageType; label: string }[] = [
    { value: "HOME", label: "Главная" },
    { value: "CATALOG", label: "Каталог" },
    { value: "CART", label: "Корзина" },
    { value: "PROFILE", label: "Профиль" },
    { value: "CUSTOM", label: "Произвольная" },
];

function slugify(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-\s]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}
