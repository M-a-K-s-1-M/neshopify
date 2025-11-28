import type { IUser } from "@/entities";
import { UsersService } from "@/shared";
import { Button, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function BannedUserButton({ user }: { user: IUser }) {
    const queryClient = useQueryClient();

    const bannedUserMutation = useMutation({
        mutationFn: async () => await UsersService.ban(user.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-table'] });
            queryClient.invalidateQueries({ queryKey: ['users-mini-table'] });

            notifications.show({
                title: 'Успешно',
                message: `Пользователь ${user.email} успешно заблокирован.`,
                color: 'green',
            })
        },
        onError: (error) => {
            notifications.show({
                title: 'Ошибка',
                message: error.response?.data?.message ?? `Не удалось заблокировать пользователя ${user.email}.`,
                color: 'red',
            });
        }
    })

    const bannedUserConfirm = () => modals.openConfirmModal({
        title: 'Блокировка пользователя',
        children: (
            <Text>Вы уверены, что хотите заблокировать пользователя <Text span fw={500} c={'blue'}>{user.email}</Text>?</Text>
        ),
        labels: { confirm: 'Заблокировать', cancel: 'Отмена' },
        confirmProps: { color: 'red' },
        onConfirm: () => bannedUserMutation.mutate(),
    })

    return (
        <Button variant="outline" color={"red"} onClick={bannedUserConfirm}>Заблокировать</Button>
    )
}
