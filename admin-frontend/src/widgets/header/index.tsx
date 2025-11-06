import { Flex, Text, Group, Avatar, Burger, useMantineColorScheme, ActionIcon } from "@mantine/core"
import { IconMoon, IconSun } from "@tabler/icons-react";


export function Header({ opened, toggle }: { opened: boolean, toggle: () => void }) {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    return (
        <>
            <Flex justify={'space-between'} align={'center'} >
                <Group>
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        // hiddenFrom="sm"
                        size={'sm'}
                    />

                    <Text fw={700} size={'xl'} visibleFrom="sm">Админ-панель</Text>
                </Group>

                <Group>
                    <Text>Уведомления</Text>

                    <ActionIcon variant="outline" onClick={() => toggleColorScheme()}>
                        {colorScheme === 'dark' ?
                            <IconSun size={20} />
                            :
                            <IconMoon size={20} />
                        }
                    </ActionIcon>

                    <Group gap={5} >
                        <Avatar size={'sm'} />
                        <Text>Админ</Text>
                    </Group>
                </Group>
            </Flex>
        </>
    )
}
