import { Flex, Text } from "@mantine/core";

export function BlockErrorTable({ message }: { message: string }) {
    return (
        <Flex
            miw={900}
            component="div"
            h={400}
            bdrs={'md'}
            bd={'2px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-5))'}
            w={'100%'}
            justify={'center'}
            align={'center'}
        >
            <Text fw={500} fz={'2xl'} c={'red'}>
                {message}
            </Text>
        </Flex>
    )
}
