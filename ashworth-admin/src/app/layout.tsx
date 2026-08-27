import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ashworth Club — Admin Console",
  description: "Internal admin console for Ashworth Club membership management.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Loaded via a <link> tag (not next/font) so the build never depends on
            reaching Google Fonts — falls back to the system stack in globals.css
            if the request is blocked. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased text-[#221D17]">{children}</body>
    </html>
  );
}
