import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthListener } from "@/components/AuthListener";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LPU CodeViz — Visual Code Exploration",
  description:
    "A professional visual code exploration platform for LPU students. Understand architecture, trace algorithms step-by-step, and explore dependencies with an interactive workspace.",
  keywords: [
    "code visualizer", "C programming", "data structures", "algorithm animation",
    "Lovely Professional University", "CSE101", "INT101", "CSE205", "INT301", "CSE202",
    "code architecture", "dependency graph", "visual debugging",
  ],
  authors: [{ name: "Prathamesh Sawarkar" }],
  openGraph: {
    title: "LPU CodeViz — Visual Code Exploration",
    description: "Explore code architecture with an interactive visual workspace built for LPU students.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthListener />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
