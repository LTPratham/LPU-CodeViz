import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthListener } from "@/components/AuthListener";
import ProductTour from "@/components/ProductTour";

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
  title: "CodeCanvas — AI Algorithm Visualizer & Tutor",
  description:
    "An AI-powered algorithm visualizer and learning platform for LPU students. Visualize C, C++, Python, Java, and SQL programs step-by-step with an interactive visual canvas and an AI tutor.",
  keywords: [
    "code visualizer", "C programming", "data structures", "algorithm animation",
    "Lovely Professional University", "CSE101", "INT101", "CSE205", "INT301", "CSE202",
    "algorithm tracer", "visualizer", "AI tutor", "interactive learning",
  ],
  authors: [{ name: "Prathamesh Sawarkar" }],
  openGraph: {
    title: "CodeCanvas — AI Algorithm Visualizer & Tutor",
    description: "An AI-powered algorithm visualizer and learning platform for LPU students. Visualize programs step-by-step.",
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
          <ProductTour />
        </ThemeProvider>
      </body>
    </html>
  );
}
