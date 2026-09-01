import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { TradeEntryProvider } from "@/components/features/TradeEntryProvider";
import { SiteHeader } from "@/components/layouts/SiteHeader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Trade Fusion",
  description: "Live equity trade blotter and entry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";}})();`,
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <TradeEntryProvider>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main
                id="main-content"
                className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:px-6 sm:py-8"
              >
                {children}
              </main>
            </div>
          </TradeEntryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
