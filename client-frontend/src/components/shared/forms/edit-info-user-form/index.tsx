'use client'
import { Controller, SubmitHandler, UseFormReturn } from "react-hook-form"
import { Checkbox, Field, FieldError, FieldGroup, FieldLabel, FieldSet, Input } from "@/components";
import { IEditInfoUserForm } from "@/lib";
import { useAuthStore } from "@/stores/useAuthStore";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { useEffect, useMemo, useState } from "react";

export function EditInfoUserForm({ form }: { form: UseFormReturn<IEditInfoUserForm> }) {

    const isCurrentPassword = form.watch('isCurrentPassword');
    const user = useAuthStore((s) => s.user);
    const updateMe = useAuthStore((s) => s.updateMe);
    const [success, setSuccess] = useState<string | null>(null);

    const initialEmail = useMemo(() => user?.email ?? '', [user?.email]);

    useEffect(() => {
        if (isCurrentPassword) {
            form.setValue('password', '');
            form.setValue('newPassword', '');
            form.clearErrors(['password', 'newPassword']);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCurrentPassword]);

    const onSubmit: SubmitHandler<IEditInfoUserForm> = async (data) => {
        setSuccess(null);
        form.clearErrors('root');

        const trimmedEmail = data.email.trim();
        const emailChanged = Boolean(trimmedEmail) && trimmedEmail !== initialEmail;
        const wantsPasswordChange = !data.isCurrentPassword;

        if (wantsPasswordChange) {
            if (!data.password) {
                form.setError('password', { type: 'manual', message: 'Введите текущий пароль' });
                return;
            }
            if (!data.newPassword) {
                form.setError('newPassword', { type: 'manual', message: 'Введите новый пароль' });
                return;
            }
            if (data.password === data.newPassword) {
                form.setError('newPassword', { type: 'manual', message: 'Новый пароль должен отличаться от текущего' });
                return;
            }
        }

        if (!emailChanged && !wantsPasswordChange) {
            setSuccess('Нечего сохранять');
            return;
        }

        try {
            await updateMe({
                ...(emailChanged ? { email: trimmedEmail } : {}),
                ...(wantsPasswordChange
                    ? { currentPassword: data.password, newPassword: data.newPassword }
                    : {}),
            });

            form.setValue('password', '');
            form.setValue('newPassword', '');
            form.setValue('isCurrentPassword', true);
            setSuccess('Сохранено');
        } catch (error) {
            const message = getRequestErrorMessage(error, 'Не удалось сохранить изменения');

            if (message.toLowerCase().includes('email') && message.toLowerCase().includes('использ')) {
                form.setError('email', { type: 'server', message });
                return;
            }

            if (message.toLowerCase().includes('текущ') && message.toLowerCase().includes('парол')) {
                form.setError('password', { type: 'server', message });
                return;
            }

            form.setError('root', { type: 'server', message });
        }
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
                                className="items-center *:data-[slot=field-label]:flex-initial"
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

            {form.formState.errors.root && <FieldError className="mt-2">{form.formState.errors.root.message}</FieldError>}
            {success ? <p className="mt-2 text-sm text-muted-foreground">{success}</p> : null}
        </form>
    )
}
