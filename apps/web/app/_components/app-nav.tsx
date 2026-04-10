"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BASE_NAV_ITEMS = [
  { href: "/transactions", label: "Transactions" },
  { href: "/budget-goals", label: "Budgets" },
  { href: "/net-worth", label: "Patrimoine" },
  { href: "/savings-goals", label: "Objectifs" },
  { href: "/stats", label: "Prévisions" },
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

  // Detect transaction type for context-aware button styling
  const isExpensePage = pathname.includes('/add') && pathname.includes('expense');
  const isIncomePage = pathname.includes('/add') && pathname.includes('income');

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

        // Context-aware styling for "Ajouter" button takes precedence over active state
        let linkClassName = "app-nav-link";
        
        if (item.href === "/transactions/add") {
          if (isExpensePage) {
            linkClassName = "app-nav-link app-nav-link-danger";
          } else if (isIncomePage) {
            linkClassName = "app-nav-link app-nav-link-success";
          } else if (isActive) {
            linkClassName = `app-nav-link app-nav-link-active`;
          }
        } else if (isActive) {
          linkClassName = `app-nav-link app-nav-link-active`;
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={linkClassName}
          >
            {item.label}
          </Link>
        );
      })}
      {user ? (
        <>
          <Link
            href="/profile"
            className={pathname.startsWith("/profile") ? "app-nav-link app-nav-link-active" : "app-nav-link"}
          >
            {user.name ? user.name.split(" ")[0] : "Profil"}
          </Link>
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
        </>
      ) : null}
    </nav>
  );
}
