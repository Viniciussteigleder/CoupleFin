import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";

const display = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Couple Budget Coach",
  description: "Couple Budget Coach MVP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
          rel="stylesheet"
        />
      </head>
      <body className={`${display.variable} ${body.variable} min-h-screen bg-background`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
