import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RootProvider from "@/components/providers/RootProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema Control de Transmisiones - Radio Exitosa",
  description: "Plataforma para el control de transmisiones de Radio Exitosa",
  icons: {
    icon: [
      {
        url: "https://statics.exitosanoticias.pe/exitosa/img/global/favicon.png",
        href: "https://statics.exitosanoticias.pe/exitosa/img/global/favicon.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link 
          rel="icon" 
          href="https://statics.exitosanoticias.pe/exitosa/img/global/favicon.png" 
          type="image/png"
        />
        <link 
          rel="shortcut icon" 
          href="https://statics.exitosanoticias.pe/exitosa/img/global/favicon.png" 
          type="image/png"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}