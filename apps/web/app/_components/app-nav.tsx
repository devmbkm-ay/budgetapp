"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BASE_NAV_ITEMS = [
  { href: "/transactions", label: "Transactions" },
  { href: "/transactions/add", label: "Ajouter" },
];

interface SessionUser {
  email: string;
  id: string;
  name: string | null;
}

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    let mounted = true;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const payload = (await response.json()) as { user: SessionUser | null };

        if (mounted) {
          setUser(payload.user);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      }
    };

    void loadSession();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  if (!isClient || pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return null;
  }

  const navItems = user
    ? BASE_NAV_ITEMS
    : [
        ...BASE_NAV_ITEMS,
        { href: "/login", label: "Connexion" },
        { href: "/register", label: "Inscription" },
      ];

  return (
    <nav style={styles.nav}>
      {navItems.map((item) => {
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
              flex: 1,
              textAlign: "center"
            }}
          >
            {item.label}
          </Link>
        );
      })}
      {user ? (
        <button
          type="button"
          onClick={async () => {
            await fetch("/api/auth/session", {
              method: "DELETE",
            });
            setUser(null);
            router.replace("/login");
            router.refresh();
          }}
          style={styles.linkButton}
        >
          Déconnexion
        </button>
      ) : null}
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
    padding: "6px",
    borderRadius: "20px",
    background: "rgba(10, 16, 30, 0.72)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    zIndex: 50,
    boxShadow: "0 18px 40px rgba(0, 0, 0, 0.42)",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    width: "min(380px, calc(100vw - 32px))",
  },
  link: {
    padding: "10px 4px",
    borderRadius: "14px",
    color: "rgba(235, 242, 255, 0.65)",
    fontSize: "0.86rem",
    fontWeight: 600,
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
    textDecoration: "none"
  },
  linkActive: {
    color: "#ffffff",
    background:
      "linear-gradient(135deg, rgba(10, 132, 255, 0.8), rgba(255, 69, 58, 0.86))",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
  },
  linkButton: {
    padding: "10px 4px",
    borderRadius: "14px",
    color: "rgba(255, 231, 232, 0.82)",
    fontSize: "0.86rem",
    fontWeight: 600,
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    flex: 1,
    textAlign: "center"
  },
};
