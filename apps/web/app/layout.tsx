import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppNav } from "./_components/app-nav";
import { ToastProvider, ToastContainer } from "./_components/toast";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "BudgetApp",
  description: "Suivi de budget et transactions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ToastProvider>
          {children}
          <AppNav />
          <ToastContainer position="top-right" />
        </ToastProvider>
      </body>
    </html>
  );
}
