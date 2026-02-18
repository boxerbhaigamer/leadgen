import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "LeadGen — Scrape Business Leads from Google Maps, Justdial & More",
  description:
    "India's #1 lead generation platform. Scrape unlimited business leads from Google Maps, Justdial, and IndiaMART. Free to start, no cloud costs.",
  keywords: "lead generation, google maps scraper, business leads, justdial scraper, indiamart, india",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
