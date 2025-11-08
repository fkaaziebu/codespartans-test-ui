import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AutoLogout from "@/components/logout";
import { ToastContainer } from "react-toastify";
import { Toaster } from "@/components/ui/toaster";

import "react-toastify/dist/ReactToastify.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ExamSim",
  description: "An interactive platform for exam preparation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 antialiased`}
      >
        <ToastContainer />
        <AutoLogout />
        <Toaster />
        {children}
      </body>
    </html>
  );
}
