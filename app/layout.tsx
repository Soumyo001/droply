import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ImagekitProvider from "./components/providers/imagekit_provider";
import ConditionalHeader from "./components/conditional_header/conditional_header";
import AppThemeProvider from "./components/providers/theme_provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter"
})

export const metadata: Metadata = {
  title: "Droply",
  description: "User friendly dropbox clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={`${inter.variable} antialiased`}>
        <body style={{
          maxWidth: "100vw",
          overflowX: "hidden"
        }}>
          <AppThemeProvider>
            <ConditionalHeader/>
            <main style={{
              flex: 1,
              minWidth: 0,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              padding: "20px"
            }}>
              <ImagekitProvider>
                {children}
              </ImagekitProvider>
            </main>
          </AppThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
