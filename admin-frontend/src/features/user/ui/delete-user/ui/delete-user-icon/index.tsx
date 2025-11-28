import type { IUser } from "@/entities";
import { UsersService } from "@/shared";
import { ActionIcon, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function DeleteUserIcon({ user }: { user: IUser }) {
    const queryClient = useQueryClient();

    const deleteUserMutation = useMutation({
        mutationFn: async () => await UsersService.delete(user.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-table'] });
            queryClient.invalidateQueries({ queryKey: ['user-table-mini'] });

            notifications.show({
                title: 'Успешно',
                message: `Пользователь ${user.email} успешно удален.`,
                color: 'green',
            })
        },
        onError: (error) => {
            notifications.show({
                title: 'Ошибка',
                message: error.response?.data?.message || `Не удалось удалить пользователя ${user.email}.`,
                color: 'red',
            })
        },

    })

    const deleteUserConfirm = () => modals.openConfirmModal({
        title: 'Удалить пользователя',
        children: (
            <Text>Вы уверены, что хотите удалить пользователя <Text span fw={500} c={'blue'}>{user.email}</Text>?</Text>
        ),
        labels: { confirm: 'Удалить', cancel: 'Отмена' },
        confirmProps: { color: 'red' },
        onConfirm: () => {
            deleteUserMutation.mutate();
        },
    })

    return (
        <ActionIcon onClick={deleteUserConfirm} color="red" >
            <IconTrash />
        </ActionIcon>
    )
}
