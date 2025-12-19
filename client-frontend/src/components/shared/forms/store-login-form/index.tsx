'use client'

import { Button, Field, FieldError, FieldGroup, FieldLabel, FieldSet, Input } from "@/components";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

interface StoreAuthForm {
    email: string;
    password: string;
}

function getSafeReturnTo(returnTo: string | null, basePath: string) {
    if (!returnTo) return basePath;
    const trimmed = returnTo.trim();
    if (!trimmed.startsWith('/')) return basePath;
    if (!trimmed.startsWith(basePath)) return basePath;
    return trimmed;
}

export function StoreLoginForm({ siteId, basePath }: { siteId: string; basePath: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const loginCustomer = useAuthStore((s) => s.loginCustomer);
    const isLoading = useAuthStore((s) => s.isLoading);

    const form = useForm<StoreAuthForm>({
        mode: 'onSubmit',
        defaultValues: { email: '', password: '' },
    });

    const onSubmit: SubmitHandler<StoreAuthForm> = async (data) => {
        form.clearErrors('root');
        try {
            await loginCustomer(siteId, data.email, data.password);
            const returnTo = getSafeReturnTo(searchParams.get('returnTo'), basePath);
            router.replace(returnTo);
        } catch (error) {
            const message = getRequestErrorMessage(error, 'Не удалось войти. Попробуйте ещё раз.');
            form.setError('root', { type: 'server', message });
        }
    };

    return (
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6">
            <div className="mb-6 space-y-1">
                <h1 className="text-2xl font-semibold">Вход в магазин</h1>
                <p className="text-sm text-muted-foreground">Этот аккаунт относится только к этому магазину.</p>
            </div>

            <form id="store-login-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                            }}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="gap-1">
                                    <FieldLabel htmlFor="password">Пароль</FieldLabel>
                                    <Input {...field} id="password" aria-invalid={fieldState.invalid} placeholder="Введите пароль" type="password" autoComplete="off" />
                                    {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </FieldSet>

                {form.formState.errors.root && <FieldError className="mt-2">{form.formState.errors.root.message}</FieldError>}

                <FieldSet className="mt-6">
                    <Button type="submit" form="store-login-form" disabled={isLoading || !form.formState.isValid}>
                        {isLoading ? 'Входим...' : 'Войти'}
                    </Button>
                </FieldSet>
            </form>

            <p className="mt-4 text-sm text-muted-foreground">
                Нет аккаунта?{' '}
                <Link
                    className="text-foreground underline underline-offset-4"
                    href={`${basePath}/auth/register${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
                >
                    Зарегистрироваться
                </Link>
            </p>
        </div>
    );
}
