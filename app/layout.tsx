import type React from "react";
import { Inter, Rubik } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";

const inter = Inter({ subsets: ["latin"] });

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  display: "swap"
});

// Load Robit Trial font variations
const robitBold = localFont({
  src: "../public/fonts/robittrial-bold.otf",
  variable: "--font-robit-bold",
});

const robitMedium = localFont({
  src: "../public/fonts/robittrial-medium.otf",
  variable: "--font-robit-medium",
});

const robitRegular = localFont({
  src: "../public/fonts/robittrial-regular.otf",
  variable: "--font-robit-regular",
});

export const metadata = {
  title: "Intellect - Interactive Learning Platform",
  description:
    "Enhance your learning experience with interactive simulations and AI-powered tutoring",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${robitBold.variable} ${robitMedium.variable} ${robitRegular.variable} ${rubik.variable}`}
    >
      <body className={`${inter.className} font-rubik`} suppressHydrationWarning>
        <UserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
