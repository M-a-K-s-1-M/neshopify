'use client'

import { Button, Field, FieldError, FieldGroup, FieldLabel, FieldSet, Input } from "@/components";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

interface StoreRegisterFormValues {
    email: string;
    password: string;
    confirmPassword: string;
}

function getSafeReturnTo(returnTo: string | null, basePath: string) {
    if (!returnTo) return basePath;
    const trimmed = returnTo.trim();
    if (!trimmed.startsWith('/')) return basePath;
    if (!trimmed.startsWith(basePath)) return basePath;
    return trimmed;
}

export function StoreRegisterForm({ siteId, basePath }: { siteId: string; basePath: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registerCustomer = useAuthStore((s) => s.registerCustomer);
    const isLoading = useAuthStore((s) => s.isLoading);

    const form = useForm<StoreRegisterFormValues>({
        mode: 'onSubmit',
        defaultValues: { email: '', password: '', confirmPassword: '' },
    });

    const onSubmit: SubmitHandler<StoreRegisterFormValues> = async (data) => {
        form.clearErrors('root');

        if (data.password !== data.confirmPassword) {
            form.setError('confirmPassword', { type: 'manual', message: 'Пароли не совпадают' });
            return;
        }

        try {
            await registerCustomer(siteId, data.email, data.password);
            const returnTo = getSafeReturnTo(searchParams.get('returnTo'), basePath);
            router.replace(returnTo);
        } catch (error) {
            const message = getRequestErrorMessage(error, 'Не удалось завершить регистрацию. Попробуйте ещё раз.');
            form.setError('root', { type: 'server', message });
        }
    };

    return (
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6">
            <div className="mb-6 space-y-1">
                <h1 className="text-2xl font-semibold">Регистрация в магазине</h1>
                <p className="text-sm text-muted-foreground">Аккаунт создаётся отдельно для этого магазина.</p>
            </div>

            <form id="store-register-form" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldSet>
                    <FieldGroup>
                        <Controller
                            name="email"
                            control={form.control}
                            rules={{
                                required: 'Электронная почта обязательна',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Неверный формат электронной почты',
                                },
                            }}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="gap-1">
                                    <FieldLabel htmlFor="email">Электронная почта</FieldLabel>
                                    <Input {...field} id="email" aria-invalid={fieldState.invalid} placeholder="user@example.com" autoComplete="off" />
                                    {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                                </Field>
                            )}
                        />

                        <Controller
                            name="password"
                            control={form.control}
                            rules={{
                                required: 'Пароль обязателен',
                                minLength: { value: 6, message: 'Пароль должен содержать не менее 6 символов' },
                                maxLength: { value: 20, message: 'Пароль должен содержать не более 20 символов' },
                            }}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="gap-1">
                                    <FieldLabel htmlFor="password">Пароль</FieldLabel>
                                    <Input {...field} id="password" aria-invalid={fieldState.invalid} placeholder="Введите пароль" type="password" autoComplete="off" />
                                    {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                                </Field>
                            )}
                        />

                        <Controller
                            name="confirmPassword"
                            control={form.control}
                            rules={{
                                required: 'Подтверждение пароля обязательно',
                                minLength: { value: 6, message: 'Пароль должен содержать не менее 6 символов' },
                                maxLength: { value: 20, message: 'Пароль должен содержать не более 20 символов' },
                            }}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="gap-1">
                                    <FieldLabel htmlFor="confirmPassword">Подтверждение пароля</FieldLabel>
                                    <Input {...field} id="confirmPassword" aria-invalid={fieldState.invalid} placeholder="Подтвердите пароль" type="password" autoComplete="off" />
                                    {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </FieldSet>

                {form.formState.errors.root && <FieldError className="mt-2">{form.formState.errors.root.message}</FieldError>}

                <FieldSet className="mt-6">
                    <Button type="submit" form="store-register-form" disabled={isLoading || !form.formState.isValid}>
                        {isLoading ? 'Создаём...' : 'Создать аккаунт'}
                    </Button>
                </FieldSet>
            </form>

            <p className="mt-4 text-sm text-muted-foreground">
                Уже есть аккаунт?{' '}
                <Link
                    className="text-foreground underline underline-offset-4"
                    href={`${basePath}/auth${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
                >
                    Войти
                </Link>
            </p>
        </div>
    );
}
