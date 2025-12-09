'use client'

import { Button, Field, FieldError, FieldGroup, FieldLabel, FieldSet, Input } from "@/components"
import { IRegisterForm } from "@/lib"
import { getRequestErrorMessage } from "@/lib/utils/error"
import { useAuthStore } from "@/stores/useAuthStore"
import { useRouter } from "next/navigation"
import { Controller, SubmitHandler, useForm } from "react-hook-form"

export function RegisterForm() {
    const router = useRouter()
    const registerUser = useAuthStore((state) => state.register)
    const isLoading = useAuthStore((state) => state.isLoading)

    const form = useForm<IRegisterForm>({
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        }
    })

    const onSubmit: SubmitHandler<IRegisterForm> = async (data) => {
        form.clearErrors('root')

        if (data.confirmPassword !== data.password) {
            form.setError('confirmPassword', { type: 'manual', message: 'Пароли не совпадают' })
            return
        }

        try {
            await registerUser(data.email, data.password)
            router.replace('/sites')
        } catch (error) {
            const message = getRequestErrorMessage(error, 'Не удалось завершить регистрацию. Попробуйте ещё раз.')
            form.setError('root', { type: 'server', message })
        }
    }

    return (
        <form id='register-form' onSubmit={form.handleSubmit(onSubmit)}>
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

                    <Controller
                        name='confirmPassword'
                        control={form.control}
                        rules={{
                            required: "Подтверждение пароля обязательно",
                            minLength: { value: 6, message: "Пароль должен содержать не менее 6 символов" },
                            maxLength: { value: 20, message: "Пароль должен содержать не более 20 символов" },
                        }}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="gap-1">
                                <FieldLabel htmlFor="confirmPassword">Подтверждение пароля</FieldLabel>
                                <Input
                                    {...field}
                                    id="confirmPassword"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Подтвердите пароль"
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
                    form="register-form"
                    disabled={isLoading || !form.formState.isValid}
                >
                    {isLoading ? 'Создаём...' : 'Создать аккаунт'}
                </Button>
            </FieldSet>
        </form>
    )
}
