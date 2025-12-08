'use client'
import { Controller, SubmitHandler, useForm, UseFormReturn } from "react-hook-form"
import { IEditInfoUserForm } from "../../types";
import { Checkbox, Field, FieldError, FieldGroup, FieldLabel, FieldSet, Input } from "@/components";

export function EditInfoUserForm({ form }: { form: UseFormReturn<IEditInfoUserForm> }) {

    const isCurrentPassword = form.watch('isCurrentPassword');

    const onSubmit: SubmitHandler<IEditInfoUserForm> = async (data) => {
        console.log(data);
    }

    return (
        <form id='edit-info-user-form' onSubmit={form.handleSubmit(onSubmit)}>
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
                            <Field data-invalid={fieldState.invalid}>
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
                        disabled={isCurrentPassword}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="password">Старый пароль</FieldLabel>
                                <Input
                                    {...field}
                                    id="password"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Введите старый пароль"
                                    type="password"
                                    autoComplete='off'
                                    disabled={isCurrentPassword}
                                />
                                {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                            </Field>
                        )}
                    />
                    <Controller
                        name='newPassword'
                        control={form.control}
                        rules={{
                            required: "Пароль обязателен",
                            minLength: { value: 6, message: "Пароль должен содержать не менее 6 символов" },
                            maxLength: { value: 20, message: "Пароль должен содержать не более 20 символов" },
                        }}
                        disabled={isCurrentPassword}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="newPassword">Новый пароль</FieldLabel>
                                <Input
                                    {...field}
                                    id="newPassword"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Введите новый пароль"
                                    type="password"
                                    autoComplete='off'
                                    disabled={isCurrentPassword}
                                />
                                {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                            </Field>
                        )}
                    />

                    <Controller
                        name="isCurrentPassword"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field
                                data-invalid={fieldState.invalid}
                                orientation={'horizontal'}
                                className="items-center [&>[data-slot=field-label]]:flex-initial"
                            >
                                <FieldLabel htmlFor="isCurrentPassword" className="w-auto flex-none" >Оставить старый пароль</FieldLabel>
                                <Checkbox
                                    id="isCurrentPassword"
                                    name={field.name}
                                    onBlur={field.onBlur}
                                    aria-invalid={fieldState.invalid}
                                    checked={!!field.value}
                                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                    ref={field.ref}
                                />
                            </Field>
                        )}
                    />

                </FieldGroup>
            </FieldSet>
        </form>
    )
}
