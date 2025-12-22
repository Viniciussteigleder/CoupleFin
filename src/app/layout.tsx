import type { Metadata } from "next";
import { Manrope, Noto_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";

const display = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Noto_Sans({
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
      <body className={`${display.variable} ${body.variable} min-h-screen bg-background`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
