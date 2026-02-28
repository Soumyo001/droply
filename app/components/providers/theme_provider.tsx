import { ThemeProvider } from "next-themes";
import React from "react";

export default function AppThemeProvider ({children}: {children: React.ReactNode}) {
    return (
        <ThemeProvider attribute="class" enableSystem defaultTheme="system">
            {children}
        </ThemeProvider>
    );
}