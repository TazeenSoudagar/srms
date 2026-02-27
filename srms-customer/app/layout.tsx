import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "SRMS - Professional Home Services",
    template: "%s | SRMS",
  },
  description:
    "Book professional home services - cleaning, plumbing, electrical, and more. Trusted professionals at your doorstep.",
  keywords: ["home services", "plumber", "electrician", "cleaning", "repair"],
  authors: [{ name: "SRMS Team" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://srms.example.com",
    siteName: "SRMS",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SRMS - Professional Home Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SRMS - Professional Home Services",
    description: "Book trusted professionals for all your home service needs",
    images: ["/twitter-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
