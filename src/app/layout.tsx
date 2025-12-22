import type { Metadata } from "next";
import { Manrope, Material_Symbols_Outlined } from "next/font/google";
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

const symbols = Material_Symbols_Outlined({
  subsets: ["latin"],
  variable: "--font-symbols",
  display: "swap",
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
      <body
        className={`${display.variable} ${body.variable} ${symbols.variable} min-h-screen bg-background`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
