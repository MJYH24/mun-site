// src/app/layout.tsx
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "MUN On The Rhine",
  description: "Model United Nations Conference Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col text-[var(--fg)] bg-[var(--bg-gradient)]">
        {/* Header */}
        <header className="header-bar">
          <Navbar />
        </header>

        {/* Main: no global card wrapper so pages can be full-bleed */}
        <main className="flex-1 w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="page-wrap py-8 text-sm text-muted">
          © {new Date().getFullYear()} MUN On The Rhine
        </footer>
      </body>
    </html>
  );
}