import { CreateUserModal } from "@/entities/user";
import { Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export function AddUser() {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
            <Button onClick={open} color="button">Добавить пользователя</Button>

            <CreateUserModal opened={opened} onClose={close} />
        </>
    )
}
