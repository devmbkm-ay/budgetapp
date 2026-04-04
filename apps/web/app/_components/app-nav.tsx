"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Accueil" },
  { href: "/transactions", label: "Transactions" },
  { href: "/transactions/add", label: "Ajouter" },
  { href: "/login", label: "Connexion" },
  { href: "/register", label: "Inscription" },
];

export function AppNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return null;
  }

  return (
    <nav style={styles.nav}>
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              ...styles.link,
              ...(isActive ? styles.linkActive : null),
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: "fixed",
    left: "50%",
    bottom: "18px",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "8px",
    padding: "8px",
    borderRadius: "999px",
    background: "rgba(10, 16, 30, 0.72)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    zIndex: 50,
    boxShadow: "0 18px 40px rgba(0, 0, 0, 0.22)",
  },
  link: {
    padding: "10px 14px",
    borderRadius: "999px",
    color: "rgba(235, 242, 255, 0.78)",
    fontSize: "0.92rem",
    fontWeight: 600,
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  linkActive: {
    color: "#ffffff",
    background:
      "linear-gradient(135deg, rgba(255, 69, 58, 0.96), rgba(10, 132, 255, 0.8))",
    boxShadow: "0 10px 24px rgba(10, 132, 255, 0.18)",
  },
};
