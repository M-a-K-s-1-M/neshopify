import { topStoresMock } from "@/shared";
import { Accordion, Avatar, Flex, Group, Stack, Text } from "@mantine/core";

export function TopStores() {

    return (
        <Accordion>
            <Accordion.Item value="Топ магазинов">
                <Accordion.Control>
                    <Text style={{ textWrap: 'nowrap' }}>Топ магазинов</Text>
                </Accordion.Control>
                <Accordion.Panel>
                    {topStoresMock.map(store => (
                        <Flex key={store.id} wrap={'wrap'} gap='xs' justify={'space-between'} align={'center'} p={'xs'}>
                            <Group gap={'xs'} wrap="nowrap">
                                <Avatar />
                                <Stack gap={0}>
                                    <Text fw={500}>{store.name}</Text>
                                    <Text c='textSecondary.6'>ID: {store.id}</Text>
                                </Stack>
                            </Group>

                            <Text fw={500} fz={'lg'}>{store.revenueFormatted}</Text>
                        </Flex>
                    ))}
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    )
}
