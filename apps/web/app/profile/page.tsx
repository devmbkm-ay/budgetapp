"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProfileUser {
  id: string;
  email: string;
  name: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [infoStatus, setInfoStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/profile", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { user?: ProfileUser; error?: string }) => {
        if (!mounted) return;
        if (data.user) {
          setUser(data.user);
          setName(data.user.name ?? "");
          setEmail(data.user.email);
        } else {
          router.replace("/login");
        }
      })
      .catch(() => router.replace("/login"))
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [router]);

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingInfo(true);
    setInfoStatus(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || null, email: email.trim() }),
      });
      const data = (await res.json()) as { user?: ProfileUser; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de la mise à jour.");
      setUser(data.user!);
      setInfoStatus({ type: "success", message: "Informations mises à jour." });
    } catch (err) {
      setInfoStatus({ type: "error", message: err instanceof Error ? err.message : "Erreur." });
    } finally {
      setIsSavingInfo(false);
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordStatus(null);
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus({ type: "error", message: "Le mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json()) as { user?: ProfileUser; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de la mise à jour.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus({ type: "success", message: "Mot de passe mis à jour." });
    } catch (err) {
      setPasswordStatus({ type: "error", message: err instanceof Error ? err.message : "Erreur." });
    } finally {
      setIsSavingPassword(false);
    }
  }

  if (isLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.skeleton} />
      </div>
    );
  }

  if (!user) return null;

  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Avatar */}
        <div style={styles.avatarRow}>
          <div style={styles.avatar}>{initials}</div>
          <div>
            <div style={styles.avatarName}>{user.name ?? "—"}</div>
            <div style={styles.avatarEmail}>{user.email}</div>
          </div>
        </div>

        {/* Personal info */}
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Informations personnelles</h2>
          <form onSubmit={handleSaveInfo} style={styles.form}>
            <label style={styles.label}>
              Nom
              <input
                style={styles.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                autoComplete="name"
              />
            </label>
            <label style={styles.label}>
              Email
              <input
                style={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            {infoStatus && (
              <p style={infoStatus.type === "success" ? styles.successMsg : styles.errorMsg}>
                {infoStatus.message}
              </p>
            )}
            <button type="submit" style={styles.btn} disabled={isSavingInfo}>
              {isSavingInfo ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        </section>

        {/* Password */}
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Changer le mot de passe</h2>
          <form onSubmit={handleSavePassword} style={styles.form}>
            <label style={styles.label}>
              Mot de passe actuel
              <input
                style={styles.input}
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <label style={styles.label}>
              Nouveau mot de passe
              <input
                style={styles.input}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>
            <label style={styles.label}>
              Confirmer le mot de passe
              <input
                style={styles.input}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>
            {passwordStatus && (
              <p style={passwordStatus.type === "success" ? styles.successMsg : styles.errorMsg}>
                {passwordStatus.message}
              </p>
            )}
            <button type="submit" style={styles.btn} disabled={isSavingPassword}>
              {isSavingPassword ? "Enregistrement…" : "Mettre à jour"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #081120 0%, #0e1831 42%, #1d1023 100%)",
    color: "#f6fbff",
    paddingBottom: "100px",
  },
  container: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "32px 16px 0",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  avatarRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "24px 0 8px",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(59,130,246,0.8), rgba(127,240,182,0.6))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: 700,
    color: "#f6fbff",
  },
  avatarEmail: {
    fontSize: 13,
    color: "rgba(246,251,255,0.55)",
    marginTop: 2,
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 16,
    padding: "24px 20px",
    backdropFilter: "blur(12px)",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "rgba(246,251,255,0.75)",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 13,
    color: "rgba(246,251,255,0.6)",
    fontWeight: 500,
  },
  input: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#f6fbff",
    fontSize: 15,
    outline: "none",
  },
  btn: {
    marginTop: 4,
    padding: "12px 0",
    borderRadius: 12,
    background: "linear-gradient(135deg, rgba(59,130,246,0.85), rgba(127,240,182,0.7))",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    border: "none",
    cursor: "pointer",
  },
  successMsg: {
    fontSize: 13,
    color: "#7ff0b6",
    margin: 0,
  },
  errorMsg: {
    fontSize: 13,
    color: "#ff8e87",
    margin: 0,
  },
  skeleton: {
    margin: "60px auto",
    width: 320,
    height: 200,
    borderRadius: 16,
    background: "rgba(255,255,255,0.04)",
  },
};
