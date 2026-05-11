import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "LPU CodeViz — Interactive Code Visualization for LPU Students",
  description:
    "Understand code, don't just copy it. LPU CodeViz visualizes C, C++, Python and SQL code step-by-step with animated data structures, plain-English explanations, and an AI tutor — built for LPU B.Tech students.",
  keywords: [
    "LPU", "code visualizer", "C programming", "data structures", "algorithm animation",
    "Lovely Professional University", "CSE101", "INT101", "CSE205", "INT301", "CSE202",
  ],
  authors: [{ name: "LPU CodeViz" }],
  openGraph: {
    title: "LPU CodeViz — Interactive Code Visualization",
    description: "Visualize C, C++, Python, SQL code with animations + AI tutor explanations.",
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
