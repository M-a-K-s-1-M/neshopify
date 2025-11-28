import type { IUser } from "@/entities";
import { UsersService } from "@/shared";
import { Button, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function UnbannedUserButton({ user }: { user: IUser }) {
    const queryClient = useQueryClient();

    const unbannedUserMutation = useMutation({
        mutationFn: async () => await UsersService.unban(user.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-table'] });
            queryClient.invalidateQueries({ queryKey: ['users-mini-table'] });

            notifications.show({
                title: 'Успешно',
                message: `Пользователь ${user.email} успешно разблокирован.`,
                color: 'green',
            })
        },
        onError: (error) => {
            notifications.show({
                title: 'Ошибка',
                message: error.response?.data?.message ?? `Не удалось разблокировать пользователя ${user.email}.`,
                color: 'red',
            });
        }
    })

    const unbannedUserConfirm = () => modals.openConfirmModal({
        title: 'Разблокировка пользователя',
        children: (
            <Text>Вы уверены, что хотите разблокировать пользователя <Text span fw={500} c={'blue'}>{user.email}</Text>?</Text>
        ),
        labels: { confirm: 'Разблокировать', cancel: 'Отмена' },
        onConfirm: () => unbannedUserMutation.mutate(),
    })

    return (
        <Button variant="outline" color={"orange"} onClick={unbannedUserConfirm}>Разблокировать</Button>
    )
}
