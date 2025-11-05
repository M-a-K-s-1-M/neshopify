import { createTheme, MantineProvider } from "@mantine/core";
import React from "react";

const theme = createTheme({
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif'
})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <MantineProvider theme={theme}>
            {children}
        </MantineProvider>
    )
}