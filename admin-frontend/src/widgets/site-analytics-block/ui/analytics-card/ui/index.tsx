import { Box, Center, Flex, Stack, Text, ThemeIcon } from "@mantine/core";
import { useLocation } from "react-router-dom";
import type { IAnalyticsCardVM } from "../model";
import './styles.scss';
import { IconUser, IconUserCheck, IconUserOff, IconUserPlus } from "@tabler/icons-react";

export function AnalyticsCard({ card }: { card: IAnalyticsCardVM }) {
    const location = useLocation();
    const pathname = location.pathname;

    switch (pathname) {
        case '/':
            return <Box className={'analytics-card'} component="div" p={'lg'} w={{ base: '100%', xs: 250 }} bdrs={'md'}>
                <Stack gap={2} >
                    <Text className={"analytics-card__title"} style={{ textWrap: 'nowrap' }}>{card.title}</Text>
                    <Text size="xl" fw={700}>{card.value}</Text>
                    <Text className={'analytics-card__change-label'} size="sm">{card.changeLabel}</Text>
                </Stack>
            </Box>;

        case '/users-management':
            return <Box component="div" className="analytics-card" bdrs={'md'} px={'lg'} py={'md'}>
                <Flex gap={'xs'} justify={'space-between'}>
                    <Stack gap={0}>
                        <Text className="analytics-card__title" style={{ textWrap: 'nowrap' }}>{card.title}</Text>
                        <Text size="xl" fw={700}>{card.value}</Text>
                    </Stack>

                    <Center>
                        <ThemeIcon color="gray" variant="light" size={'xl'} >
                            {card.title === "Всего пользователей" ? <IconUser />
                                :
                                card.title === "Активных" ? <IconUserCheck />
                                    :
                                    card.title === "Новых за месяц" ? <IconUserPlus />
                                        :
                                        <IconUserOff />
                            }
                        </ThemeIcon>
                    </Center>

                </Flex>
            </Box>
    }

}
