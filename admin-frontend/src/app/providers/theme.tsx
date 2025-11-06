import { createTheme, MantineProvider, virtualColor } from "@mantine/core";
import React from "react";


const theme = createTheme({
    // primaryColor: 'gray',
    // primaryShade: { dark: 6, light: 6 },

    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    autoContrast: true, // Автоматически меняет цвет текста на черный/белый, в зависимости от яркости фона
    luminanceThreshold: 0.3, // Если яркость цвета > 0.3 - текст черный, иначе белый

    fontSizes: {
        "2xl": '1.5rem',
        "3xl": '1.75rem',
    },

    spacing: {
        "2xl": '2.5rem',
        "3xl": '3.25rem'
    },

    // accent, primary, secondary, hover, error, success
    colors: {

        background: virtualColor({
            name: 'background',
            dark: 'gray',
            light: 'gray',
        }),

        backgroundSecondary: virtualColor({
            name: 'background-secondary',
            dark: 'gray',
            light: 'gray',
        }),

        text: virtualColor({
            name: 'text',
            dark: 'gray',
            light: 'gray',
        }),

        textSecondary: virtualColor({
            name: 'textSecondary',
            dark: 'gray',
            light: 'gray',
        }),

        button: virtualColor({
            name: 'button',
            dark: 'gray',
            light: 'gray',
        })
    }
})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <MantineProvider theme={theme}>
            {children}
        </MantineProvider>
    )
}