import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
  /** Optional: hides footer for game-like or fullscreen pages */
  noFooter?: boolean;
  /** Optional: hides header */
  noHeader?: boolean;
  /** Optional: removes default padding from main content area */
  noPadding?: boolean;
}

export function Layout({
  children,
  noFooter = false,
  noHeader = false,
  noPadding: _noPadding = false,
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!noHeader && <Header />}
      {/* pb-16 on mobile reserves space for the fixed bottom nav bar */}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      {!noFooter && <Footer />}
    </div>
  );
}
