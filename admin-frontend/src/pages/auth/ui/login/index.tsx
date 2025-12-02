import { useAuth } from "@/app/stores";
import { Button, Input, PasswordInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

interface ILoginForm {
    email: string;
    password: string;
}

export function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const fromPage = location.state?.from?.pathname || '/';

    const { login } = useAuth()

    const { register, formState, handleSubmit } = useForm<ILoginForm>({
        mode: "onSubmit"
    });

    const emailError = formState.errors.email?.message;
    const passwordError = formState.errors.password?.message;

    const onSubmit: SubmitHandler<ILoginForm> = async (data) => {
        try {
            const res = await login(data.email, data.password);

            console.log('Logged in user:', res);

            navigate(fromPage, { replace: true });
        } catch (error) {
            notifications.show({
                color: 'red',
                title: 'Ошибка',
                message: error.response?.data?.message || 'Не удалось войти в систему',
            })
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Input.Wrapper
                error={emailError ?? undefined}
                label="Электронная почта"
                required
                mb={'md'}
            >
                <Input
                    {...register('email', {
                        required: 'Электронная почта обязательна',
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Неверный формат электронной почты'
                        },
                    })}
                    placeholder="admin@example.com"
                />
            </Input.Wrapper>

            <Input.Wrapper
                label="Пароль"
                error={passwordError ?? undefined}
                required
            >
                <PasswordInput
                    type="password"
                    {...register('password', {
                        required: 'Пароль обязателен',
                        minLength: { value: 6, message: "Пароль должен содержать не менее 6 символов" },
                        maxLength: { value: 20, message: "Пароль должен содержать не более 20 символов" }
                    })}
                    placeholder="Ваш пароль"
                />
            </Input.Wrapper>

            <Button type="submit" fullWidth mt={60}>Войти</Button>
        </form>
    )
}
