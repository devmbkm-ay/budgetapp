"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SessionUser {
  email: string;
  id: string;
  name: string | null;
}

const PRIMARY = [
  { href: "/transactions", label: "Transactions", emoji: "📋" },
  { href: "/budget-goals", label: "Budgets", emoji: "🎯" },
  { href: "/transactions/add", label: "Ajouter", emoji: "➕" },
  { href: "/stats", label: "Prévisions", emoji: "📈" },
];

const MORE = [
  { href: "/net-worth", label: "Patrimoine", emoji: "🏦" },
  { href: "/savings-goals", label: "Objectifs", emoji: "🪙" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const payload = (await res.json()) as { user: SessionUser | null };
        if (mounted) setUser(payload.user);
      } catch {
        if (mounted) setUser(null);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [pathname]);

  // Close more menu on navigation
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  if (!isClient || pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return null;
  }

  const isExpensePage = pathname.includes("/add") && pathname.includes("expense");
  const isIncomePage = pathname.includes("/add") && pathname.includes("income");

  // Which primary slot is active? (0–3 = primary items, 4 = more button)
  const activeIndex = (() => {
    for (let i = 0; i < PRIMARY.length; i++) {
      const item = PRIMARY[i]!;
      const isAdd = item.href === "/transactions/add";
      const match = isAdd
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(item.href + "/");
      if (match) return i;
    }
    const moreActive = MORE.some(
      (m) => pathname === m.href || pathname.startsWith(m.href + "/"),
    ) || pathname.startsWith("/profile");
    return moreActive ? 4 : -1;
  })();

  // Which "more" item is currently active (if any)
  const activeMoreItem =
    MORE.find((m) => pathname === m.href || pathname.startsWith(m.href + "/")) ??
    (pathname.startsWith("/profile") ? { emoji: "👤", label: "Profil" } : null);

  const logout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
    setMoreOpen(false);
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="nav-wrapper">
      {/* Backdrop for more sheet — rendered first for stacking context */}
      {moreOpen && (
        <div className="nav-backdrop" onClick={() => setMoreOpen(false)} aria-hidden="true" />
      )}

      {/* More sheet — horizontal pills layout */}
      {moreOpen && (
        <div className="nav-more-sheet" role="menu">
          {/* User profile section */}
          {user && (
            <div className="nav-more-profile">
              <div className="nav-more-avatar">{user.name?.charAt(0).toUpperCase() || "?"}</div>
              <div className="nav-more-profile-info">
                <div className="nav-more-username">{user.name || "Utilisateur"}</div>
                <div className="nav-more-email">{user.email}</div>
              </div>
            </div>
          )}

          {/* Navigation pills section */}
          <div className="nav-more-pills-container">
            {MORE.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-more-pill${isActive ? " nav-more-pill-active" : ""}`}
                  onClick={() => setMoreOpen(false)}
                  role="menuitem"
                  aria-label={`${item.label}${isActive ? " (page actuelle)" : ""}`}
                >
                  <span className="nav-more-pill-emoji">{item.emoji}</span>
                  <span className="nav-more-pill-label">{item.label}</span>
                </Link>
              );
            })}

            {/* Profile settings pill */}
            {user && (
              <Link
                href="/profile"
                className={`nav-more-pill${pathname.startsWith("/profile") ? " nav-more-pill-active" : ""}`}
                onClick={() => setMoreOpen(false)}
                role="menuitem"
                aria-label={`Paramètres${pathname.startsWith("/profile") ? " (page actuelle)" : ""}`}
              >
                <span className="nav-more-pill-emoji">⚙️</span>
                <span className="nav-more-pill-label">Paramètres</span>
              </Link>
            )}
          </div>

          {/* Logout button - danger zone */}
          {user && (
            <button
              type="button"
              className="nav-more-logout-button"
              onClick={logout}
              role="menuitem"
              aria-label="Se déconnecter de votre compte"
            >
              <span className="nav-more-logout-emoji">🚪</span>
              <span className="nav-more-logout-label">Déconnexion</span>
            </button>
          )}
        </div>
      )}

      {/* Main nav pill */}
      <nav className="app-nav" aria-label="Navigation principale">
        {/* Sliding blob indicator */}
        {activeIndex >= 0 && (
          <span
            className="nav-blob"
            style={{ left: `calc(${activeIndex} * 20% + 10%)` }}
            aria-hidden="true"
          />
        )}

        {PRIMARY.map((item, i) => {
          const isActive = i === activeIndex;
          const isAdd = item.href === "/transactions/add";
          let emoji = item.emoji;
          if (isAdd && isExpensePage) emoji = "🔴";
          if (isAdd && isIncomePage) emoji = "🟢";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${isActive ? " nav-item-active" : ""}${isAdd ? " nav-item-add" : ""}`}
              aria-current={isActive ? "page" : undefined}
              aria-label={`${item.label}${isActive ? " (page actuelle)" : ""}`}
            >
              <span className="nav-item-emoji">{emoji}</span>
              <span className="nav-item-label">{item.label}</span>
            </Link>
          );
        })}

        {/* More button — slot index 4 */}
        <button
          type="button"
          className={`nav-item${activeIndex === 4 || moreOpen ? " nav-item-active" : ""}`}
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          aria-label={moreOpen ? "Fermer le menu supplémentaire" : "Afficher plus d'options"}
        >
          <span className="nav-item-emoji" style={{ transition: "transform 0.25s ease", transform: moreOpen ? "rotate(45deg)" : "none" }}>
            ⊕
          </span>
          <span className="nav-item-label">Plus</span>
        </button>
      </nav>
    </div>
  );
}
