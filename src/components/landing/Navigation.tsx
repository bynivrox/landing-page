"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigation } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { Logo } from "./primitives";

/**
 * A framed bar of bordered cells (logo, links, actions). It takes the palette of the section beneath it (data-theme),
 * and a thin line along its bottom edge shows how far the page has scrolled.
 */
export function Navigation({ appUrl, contactUrl }: { appUrl: string; contactUrl: string }) {
  const pathname = usePathname();
  const [light, setLight] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      // The section under the middle of the bar decides its palette.
      const under = [...document.querySelectorAll<HTMLElement>("[data-theme]")]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.top <= 40 && rect.bottom >= 40;
        })
        .at(-1);
      setLight(under?.dataset.theme === "light");
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5", light ? "theme-light bg-transparent" : "theme-dark")}>
      <nav
        aria-label="Main"
        className="relative mx-auto flex h-14 max-w-[1600px] items-stretch overflow-hidden rounded-md border border-border bg-background/70 backdrop-blur-xl transition-colors duration-300"
      >
        <Link href="/" aria-label="Nivrox home" className="flex shrink-0 items-center border-r border-border px-5">
          <Logo height={15} className={cn("transition-[filter] duration-300", light && "invert")} />
        </Link>

        <ul className="mx-auto hidden items-stretch border-x border-border md:flex">
          {navigation.map((item) => (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={item.href === pathname ? "page" : undefined}
                className={cn(
                  "flex items-center px-5 text-sm transition-colors hover:text-foreground",
                  item.href === pathname ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 border-l border-border px-2 md:ml-0">
          <Link
            href={appUrl}
            className="hidden h-10 items-center rounded-sm bg-foreground/10 px-4 text-sm text-foreground transition-colors hover:bg-foreground/15 sm:flex"
          >
            Sign in
          </Link>
          <Link
            href={contactUrl}
            className={cn(
              "flex h-10 items-center rounded-sm px-4 text-sm font-medium transition-colors",
              light ? "bg-foreground text-background hover:bg-foreground/85" : "bg-white text-black hover:bg-white/85",
            )}
          >
            Request a demo
          </Link>
        </div>

        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-px bg-brand transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </nav>
    </header>
  );
}
