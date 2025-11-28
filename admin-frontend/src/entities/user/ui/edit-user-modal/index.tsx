import { CustomModal, UsersService } from "@/shared";
import type { IUser } from "../../models";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, type SubmitHandler } from "react-hook-form";
import { Button, Checkbox, Group, Input, MultiSelect, PasswordInput, Skeleton } from "@mantine/core";
import { useEffect, useRef, } from "react";
import { useUserForm } from "../../hooks";
import type { IUpdateUserForm } from "../../models/IUpdateUserForm";
import { notifications } from "@mantine/notifications";

export function EditUserModal({ opened, close, user }: { opened: boolean; close: () => void, user: IUser }) {
    const initialUserRef = useRef<IUser>(user);

    const queryClient = useQueryClient();
    const {
        arrRoles,
        control,
        register,
        handleSubmit,
        reset,
        isCurrentPassword,
        setIsCurrentPassword,
        emailError,
        passwordError,
        isPending,
        isError,
        isChangend,
    } = useUserForm<IUpdateUserForm>();

    const updateUserMutation = useMutation({
        mutationFn: async (data: IUpdateUserForm) => {
            return await UsersService.update(user.id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-table'] });
            queryClient.invalidateQueries({ queryKey: ['user-table-mini'] });

            notifications.show({
                color: 'green',
                title: 'Успех',
                message: 'Пользователь успешно обновлен',
            })
            close();
        },
        onError: (error) => {
            notifications.show({
                color: 'red',
                title: 'Ошибка',
                message: error.response?.data?.message || 'Не удалось обновить пользователя',
            })
        }
    })

    useEffect(() => {
        if (user) {
            initialUserRef.current = user;

            reset({
                email: user.email,
                roles: user.userRoles.map(userRole => userRole.role?.value)
            });
        }

    }, [user])

    const onSubmit: SubmitHandler<IUpdateUserForm> = async (data) => {
        if (!isChangend(data, initialUserRef.current)) {
            notifications.show({
                color: 'orange',
                title: 'Внимание',
                message: 'Данные не были изменены',
            })
            return;
        }

        updateUserMutation.mutate(data);
    }


    return (
        <CustomModal title="Редактировать пользователя" opened={opened} close={close}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Input.Wrapper mb={'md'} label="Электронная почта" error={emailError ?? undefined} required>
                    <Input
                        placeholder="user@example.com"
                        {...register("email", {
                            required: "Электронная почта обязательна",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Неверный формат электронной почты",
                            }
                        })}
                    />
                </Input.Wrapper>

                <PasswordInput
                    mb={'xs'}
                    label="Новый пароль"
                    placeholder="Введите новоый пароль"
                    error={!isCurrentPassword ? passwordError : undefined}
                    {...register("password", {
                        required: "Пароль обязателен",
                        minLength: { value: 6, message: "Пароль должен содержать не менее 6 символов" },
                        maxLength: { value: 20, message: "Пароль должен содержать не более 20 символов" },
                        disabled: isCurrentPassword,
                    })}
                    disabled={isCurrentPassword}
                />

                <Checkbox
                    mb={'md'}
                    label="Оставить без изменений текущий пароль"
                    checked={isCurrentPassword}
                    onChange={(event) => setIsCurrentPassword(event.currentTarget.checked)}
                />

                {isPending ?
                    <Skeleton h={40} />
                    :
                    <Controller
                        control={control}
                        name="roles"
                        defaultValue={[]}
                        rules={{ required: "Необходимо выбрать как минимум одну роль" }}
                        render={({ field, fieldState }) => (
                            <MultiSelect
                                mb={'md'}
                                label="Роли"
                                placeholder={isError ? 'Роли не найдены' : 'Выберите роли'}
                                data={arrRoles}
                                value={field.value}
                                onChange={(val) => field.onChange(val)}
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                }

                <Group justify="space-between" mt={50}>
                    <Button variant="transparent" mt="md" onClick={close}>Отмена</Button>

                    <Button type="submit" mt="md">Сохранить</Button>
                </Group>
            </form>
        </CustomModal>
    )
}
