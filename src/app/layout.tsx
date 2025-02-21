import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.css';
import React from "react";
import NextAuthProvider from "@/context/next-auth";
import AmplitudeContextProvider from "@/context/amplitude";
import {getLocale, getMessages} from 'next-intl/server';
import {NextIntlClientProvider} from 'next-intl';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "OpenHealth",
    description: "OpenHealth",
};

export default async function RootLayout({children, modal}: Readonly<{
    children: React.ReactNode;
    modal: React.ReactNode;
}>) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale}>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
            <NextAuthProvider>
                <AmplitudeContextProvider>
                    {children}
                    {modal}
                </AmplitudeContextProvider>
            </NextAuthProvider>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
