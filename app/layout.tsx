import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patos Programadores",
  description: "Sistema de mi amorcito y mío.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
