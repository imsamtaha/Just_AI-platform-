import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SAM AI — Your Intelligent Productivity Ecosystem",
    template: "%s | SAM AI",
  },
  description:
    "SAM AI is an all-in-one AI productivity platform combining AI Assistant, Planner, Writer, Business Consultant, CRM, and Automation into a single premium ecosystem.",
  keywords: [
    "AI assistant",
    "productivity",
    "AI writer",
    "AI planner",
    "business consultant",
    "CRM",
    "automation",
    "SaaS",
  ],
  authors: [{ name: "SAM AI" }],
  creator: "SAM AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "SAM AI — Your Intelligent Productivity Ecosystem",
    description:
      "All-in-one AI productivity platform for professionals and businesses.",
    siteName: "SAM AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "SAM AI",
    description: "All-in-one AI productivity platform.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF7A00",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-[#050505] text-white antialiased`}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#0D0D0D",
                color: "#E5E5E5",
                border: "1px solid rgba(255,122,0,0.2)",
              },
              success: {
                iconTheme: { primary: "#FF7A00", secondary: "#0D0D0D" },
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
