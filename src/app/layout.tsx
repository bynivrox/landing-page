import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { MotionConfig } from "motion/react";
import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";
import { site } from "@/lib/site";
import "./globals.css";

// The typefaces of the Nivrox identity (nivrox.be): geometric display/body and a technical monospace.
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nivrox · The visual infrastructure control plane",
  description:
    "Nivrox lets infrastructure teams visually model existing environments, simulate proposed changes, generate safe deployment plans and verify the result.",
};

export const viewport: Viewport = {
  themeColor: "#050608",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="min-h-svh overflow-x-clip bg-background text-foreground">
        <MotionConfig reducedMotion="user">
          <Navigation appUrl={site.appUrl} trialUrl={site.signupUrl} />
          {children}
          <Footer />
        </MotionConfig>
      </body>
    </html>
  );
}
