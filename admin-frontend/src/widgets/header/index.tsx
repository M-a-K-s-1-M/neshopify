import { Flex, Text, Group, Avatar, Burger } from "@mantine/core"

export function Header({ opened, toggle }: { opened: boolean, toggle: () => void }) {
    return (
        <>
            <Flex justify={'space-between'} align={'center'}>
                <Burger
                    opened={opened}
                    onClick={toggle}
                    hiddenFrom="sm"
                    size={'sm'}
                />
                <Text fw={700} size="lg">Админ-панель</Text>

                <Group>
                    <Text>Уведомления</Text>

                    <Group gap={'xs'}>
                        <Avatar />
                        <Text>Админ</Text>
                    </Group>
                </Group>
            </Flex>
        </>
    )
}
