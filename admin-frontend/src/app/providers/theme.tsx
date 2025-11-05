import { createTheme, MantineProvider } from "@mantine/core";
import React from "react";

const theme = createTheme({
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',

    autoContrast: true,
    luminanceThreshold: 0.3,

    primaryShade: { dark: 6, light: 6 },

    // colors: {
    //     // Синяя палитра для светлой темы
    //     blue: [
    //         '#f5f8ff', '#e1ebff', '#c7dbff', '#a3c4ff',
    //         '#7ba9ff', '#4d8dff', '#2d7cff', '#1a6ae6',
    //         '#0d5ccc', '#004bb3'
    //     ],

    //     // Серые палитры
    //     dark: [
    //         '#C1C2C5', '#A6A7AB', '#909296', '#5C5F66',
    //         '#373A40', '#2C2E33', '#25262B', '#1A1B1E',
    //         '#141517', '#101113'
    //     ],

    //     gray: [
    //         '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1',
    //         '#94a3b8', '#64748b', '#475569', '#334155',
    //         '#1e293b', '#0f172a'
    //     ],

    //     primary: virtualColor({
    //         name: 'primary',
    //         dark: 'blue',
    //         light: 'gray',
    //     }),
    // },

    // primaryColor: 'primary',


})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <MantineProvider theme={theme}>
            {children}
        </MantineProvider>
    )
}