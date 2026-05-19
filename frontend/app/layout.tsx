import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthListener } from "@/components/AuthListener";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "CodeCanvas — Interactive Code Visualization for Computer Science Students",
  description:
    "Understand code, don't just copy it. CodeCanvas visualizes C, C++, Python and SQL code step-by-step with animated data structures, plain-English explanations, and an AI tutor — built for CS students.",
  keywords: [
    "code visualizer", "C programming", "data structures", "algorithm animation",
    "Lovely Professional University", "CSE101", "INT101", "CSE205", "INT301", "CSE202",
  ],
  authors: [{ name: "CodeCanvas" }],
  openGraph: {
    title: "CodeCanvas — Interactive Code Visualization",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('contextmenu', event => event.preventDefault());
              document.addEventListener('keydown', event => {
                if (event.keyCode === 123) {
                  event.preventDefault(); // Prevent F12
                }
                if (event.ctrlKey && event.shiftKey && event.keyCode === 73) {
                  event.preventDefault(); // Prevent Ctrl+Shift+I
                }
                if (event.ctrlKey && event.shiftKey && event.keyCode === 74) {
                  event.preventDefault(); // Prevent Ctrl+Shift+J
                }
                if (event.ctrlKey && event.keyCode === 85) {
                  event.preventDefault(); // Prevent Ctrl+U
                }
                if (event.ctrlKey && event.keyCode === 67) {
                  event.preventDefault(); // Prevent Ctrl+C
                }
              });
              document.addEventListener('selectstart', event => event.preventDefault());
              document.addEventListener('dragstart', event => event.preventDefault());
            `,
          }}
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

