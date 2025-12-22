import type { Metadata } from "next";
import { Manrope, Noto_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/app/providers";
import { MotionProvider } from "@/components/app/MotionProvider";
import { Toaster } from "@/components/ui/toaster";

const display = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const symbols = localFont({
  src: "../../public/fonts/MaterialSymbolsOutlined.ttf",
  variable: "--font-symbols",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CasalFin",
  description: "CasalFin — finanças claras, riqueza a dois.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${display.variable} ${body.variable} ${symbols.variable} min-h-screen bg-background font-body antialiased`}
      >
        <Providers>
          <MotionProvider />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
