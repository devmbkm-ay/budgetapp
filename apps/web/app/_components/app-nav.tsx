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
    <nav className="app-nav">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`app-nav-link ${isActive ? "app-nav-link-active" : ""}`}
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
          className="app-nav-button"
        >
          Déconnexion
        </button>
      ) : null}
    </nav>
  );
}
