import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const favorit = localFont({
  src: "../public/Branding/ABCFavorit-Book-Trial.otf",
  variable: "--font-favorit",
  display: "swap",
});

const gtSuper = localFont({
  src: "../public/Branding/GT-Super-Display-Light-Trial.otf",
  variable: "--font-gt-super",
  display: "swap",
  weight: "300",
});

export const metadata: Metadata = {
  title: "Brand Logic",
  description: "AI-Powered Brand Identity Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${favorit.variable} ${gtSuper.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
