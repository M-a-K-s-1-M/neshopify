import { CustomModal } from "@/shared";
import UsersService from "@/shared/api/apiUsers";
import { Button, Group, Input, MultiSelect, PasswordInput, Skeleton } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

interface ICreateUserForm {
    email: string;
    password: string;
    roles: string[];
}

export function CreateUserModal({ opened, close }: { opened: boolean; close: () => void }) {

    const { data, isPending, isError } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:5000/api/roles');
            return response.data;
        }
    });

    const arrRoles = data ? data.map((role: { id: string; value: string }) => role.value) : [];

    const { register, handleSubmit, formState, control } = useForm<ICreateUserForm>({
        mode: 'onSubmit',
    })

    const emailError = formState.errors.email?.message;
    const passwordError = formState.errors.password?.message;

    const onSubmit: SubmitHandler<ICreateUserForm> = async (data) => {
        const res = await UsersService.create(data)
        // const res = await axios.post('http://localhost:5000/api/users', data);
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
