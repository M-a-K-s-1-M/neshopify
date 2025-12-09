'use client'

import { useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Field, FieldError, FieldGroup, FieldLabel, FieldSet, Input } from "@/components";
import { SitesApi } from "@/lib/api/sites";
import { queryKeys } from "@/lib/query/keys";
import { ICreateSiteForm } from "@/lib";
import { getRequestErrorMessage } from "@/lib/utils/error";

interface CreateSiteFormProps {
    onCreated?: () => void;
}

export function CreateSiteForm({ onCreated }: CreateSiteFormProps) {
    const queryClient = useQueryClient();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const slugEditedRef = useRef(false);

    const form = useForm<ICreateSiteForm>({
        mode: "onSubmit",
        defaultValues: {
            name: "",
            slug: "",
            domain: "",
        },
    });

    const nameValue = form.watch("name");

    useEffect(() => {
        if (slugEditedRef.current) {
            return;
        }
        const slug = slugify(nameValue ?? "");
        form.setValue("slug", slug, { shouldValidate: form.formState.isSubmitted });
    }, [nameValue, form]);

    const createMutation = useMutation({
        mutationFn: SitesApi.create,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.sites() });
            setSubmitError(null);
            form.reset();
            slugEditedRef.current = false;
            onCreated?.();
        },
        onError: (error) => {
            setSubmitError(getRequestErrorMessage(error, "Не удалось создать сайт"));
        },
    });

    const onSubmit: SubmitHandler<ICreateSiteForm> = async (values) => {
        setSubmitError(null);
        slugEditedRef.current = values.slug.trim().length > 0;
        await createMutation.mutateAsync({
            name: values.name.trim(),
            slug: values.slug.trim(),
            domain: values.domain?.trim() || undefined,
        });
    };

    return (
        <form id="create-site-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldSet>
                <FieldGroup>
                    <Controller
                        name="name"
                        control={form.control}
                        rules={{
                            required: "Название сайта обязательно",
                            minLength: { value: 3, message: "Минимум 3 символа" },
                            maxLength: { value: 120, message: "Максимум 120 символов" },
                        }}
                        render={({ field, fieldState }) => (
                            <Field className="gap-2">
                                <FieldLabel htmlFor="siteName">Название сайта</FieldLabel>
                                <Input
                                    {...field}
                                    id="siteName"
                                    placeholder="Мой первый сайт"
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
                        }}
                        render={({ field, fieldState }) => (
                            <Field className="gap-2">
                                <FieldLabel htmlFor="siteSlug">Slug</FieldLabel>
                                <Input
                                    {...field}
                                    id="siteSlug"
                                    placeholder="my-shop"
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
                        name="domain"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field className="gap-2">
                                <FieldLabel htmlFor="siteDomain">Домен (опционально)</FieldLabel>
                                <Input
                                    {...field}
                                    id="siteDomain"
                                    placeholder="store.example.com"
                                    autoComplete="off"
                                    aria-invalid={fieldState.invalid}
                                    disabled={createMutation.isPending}
                                />
                                {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                            </Field>
                        )}
                    />
                </FieldGroup>
            </FieldSet>

            {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
        </form>
    );
}

function slugify(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-\s]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}
