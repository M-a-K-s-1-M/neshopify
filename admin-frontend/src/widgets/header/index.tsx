import { Flex, Text, Group, Avatar, Burger, Button, useMantineColorScheme, ActionIcon, useMantineTheme } from "@mantine/core"
import { IconMoon, IconSun } from "@tabler/icons-react";


export function Header({ opened, toggle }: { opened: boolean, toggle: () => void }) {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

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
