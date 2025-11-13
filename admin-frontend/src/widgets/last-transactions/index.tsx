import { lastTransactionsMock } from "@/shared";
import { Accordion, Avatar, Flex, Group, Stack, Text } from "@mantine/core";
import { formatDate } from "date-fns";

export function LastTransactions() {
    return (
        <Accordion>
            <Accordion.Item value="Недавние транзакции">
                <Accordion.Control>Недавние транзакции</Accordion.Control>
                <Accordion.Panel>
                    {lastTransactionsMock.map(transaction => (
                        <Flex wrap={'wrap'} gap='xs' justify={'space-between'} align={'center'} p={'xs'}>
                            <Group gap={'xs'} wrap="nowrap">
                                <Stack gap={0}>
                                    <Text fw={500}>{transaction.description}</Text>
                                    <Text c='textSecondary.6'>{formatDate(transaction.date, 'dd.MM.yyyy')}</Text>
                                </Stack>
                            </Group>

                            <Text fw={500} fz={'lg'}>{transaction.amountFormatted}</Text>
                        </Flex>
                    ))}
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    )
}
