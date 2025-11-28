import { CustomModal, } from "@/shared";
import { UsersService } from "@/shared";
import { Button, Group, Input, MultiSelect, PasswordInput, Skeleton } from "@mantine/core";
import { Controller, type SubmitHandler } from "react-hook-form";
import type { ICreateUserForm } from '../../models';
import { useUserForm } from "../../hooks";

export function CreateUserModal({ opened, close }: { opened: boolean; close: () => void }) {

    const {
        arrRoles,
        control,
        register,
        handleSubmit,
        emailError,
        passwordError,
        isPending,
        isError,
    } = useUserForm<ICreateUserForm>();

    const onSubmit: SubmitHandler<ICreateUserForm> = async (data) => {
        const res = await UsersService.create(data)
        return res;
    }

    return (
        <CustomModal title="Добавить пользователя" opened={opened} close={close}>
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
                    mb={'lg'}
                    label="Пароль"
                    placeholder="Введите пароль"
                    error={passwordError ?? undefined}
                    {...register("password", {
                        required: "Пароль обязателен",
                        minLength: { value: 6, message: "Пароль должен содержать не менее 6 символов" },
                        maxLength: { value: 20, message: "Пароль должен содержать не более 20 символов" }
                    })}
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

                    <Button type="submit" mt="md">Создать пользователя</Button>
                </Group>
            </form>
        </CustomModal>

    )
}
