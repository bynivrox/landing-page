import Link from "next/link";
import { navigation } from "@/lib/sections";
import { Logo } from "./primitives";

/** Minimal: only links that exist (sections of this page); no invented URLs or social accounts. */
export function Footer() {
  return (
    <footer data-theme="light" className="theme-light">
      <div className="mx-auto max-w-7xl px-6 pt-24 pb-12">
        <div className="flex flex-col gap-10 border-t border-border pt-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo height={16} className="invert" />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The visual infrastructure control plane for environments that already exist.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/#contact" className="text-muted-foreground transition-colors hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mt-12 font-mono text-xs text-faint-foreground">© {new Date().getFullYear()} Nivrox</p>
      </div>
    </footer>
  );
}
