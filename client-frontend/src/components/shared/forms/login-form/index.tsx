'use client'

import { Button, Field, FieldError, FieldGroup, FieldLabel, FieldSet, Input } from "@/components"
import { IAuthForm } from "@/lib"
import { getRequestErrorMessage } from "@/lib/utils/error"
import { useAuthStore } from "@/stores/useAuthStore"
import { useRouter, useSearchParams } from "next/navigation"
import { Controller, SubmitHandler, useForm } from "react-hook-form"

function getSafeReturnTo(returnTo: string | null, fallback: string) {
    if (!returnTo) return fallback
    const trimmed = returnTo.trim()
    if (!trimmed) return fallback
    // only allow same-origin relative paths
    if (!trimmed.startsWith('/')) return fallback
    if (trimmed.startsWith('//')) return fallback
    return trimmed
}

export function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const login = useAuthStore((state) => state.login)
    const isLoading = useAuthStore((state) => state.isLoading)

    const form = useForm<IAuthForm>({
        mode: 'onSubmit',
        defaultValues: {
            email: '',
            password: '',
        }
    })

    const onSubmit: SubmitHandler<IAuthForm> = async (data) => {
        form.clearErrors('root')
        try {
            await login(data.email, data.password)
            const returnTo = getSafeReturnTo(searchParams.get('returnTo'), '/sites')
            router.replace(returnTo)
        } catch (error) {
            const message = getRequestErrorMessage(error, 'Не удалось войти. Попробуйте ещё раз.')
            form.setError('root', { type: 'server', message })
        }
    }

    return (
        <form id='login-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet>
                <FieldGroup>
                    <Controller
                        name="email"
                        control={form.control}
                        rules={{
                            required: "Электронная почта обязательна",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Неверный формат электронной почты",
                            }
                        }}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="gap-1">
                                <FieldLabel htmlFor="email">
                                    Электронная почта
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="email"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="user@example.com"
                                    autoComplete='off'
                                />
                                {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                            </Field>
                        )}
                    />

                    <Controller
                        name='password'
                        control={form.control}
                        rules={{
                            required: "Пароль обязателен",
                            minLength: { value: 6, message: "Пароль должен содержать не менее 6 символов" },
                            maxLength: { value: 20, message: "Пароль должен содержать не более 20 символов" },
                        }}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="gap-1">
                                <FieldLabel htmlFor="password">Пароль</FieldLabel>
                                <Input
                                    {...field}
                                    id="password"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Введите пароль"
                                    type="password"
                                    autoComplete='off'
                                />
                                {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                            </Field>
                        )}
                    />

                </FieldGroup>
            </FieldSet>
            {form.formState.errors.root && (
                <FieldError className="mt-2">{form.formState.errors.root.message}</FieldError>
            )}
            <FieldSet className="mt-6">
                <Button
                    type="submit"
                    form="login-form"
                    disabled={isLoading || !form.formState.isValid}
                >
                    {isLoading ? 'Входим...' : 'Войти'}
                </Button>
            </FieldSet>
        </form>
    )
}
