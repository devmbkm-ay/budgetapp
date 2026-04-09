"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type CSSProperties, type FormEvent } from "react";

type AuthMode = "login" | "register";

interface AuthShellProps {
  mode: AuthMode;
}

interface LoginResponse {
  error?: string;
}

export function AuthShell({ mode }: AuthShellProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLogin = mode === "login";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!isLogin && password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isLogin ? { email, password } : { email, name, password },
        ),
      });
      const payload = (await response.json()) as LoginResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Authentification impossible.");
      }

      const redirectTo = searchParams.get("redirectTo") ?? "/transactions";
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Authentification impossible.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={styles.page}>
      {/* Ambient glows */}
      <div style={styles.ambientBlue} />
      <div style={styles.ambientCoral} />

      <div style={styles.shell}>
        {/* Hero text */}
        <section style={styles.hero}>
          <p style={styles.eyebrow}>Secure budget flow</p>
          <h1 style={styles.heroTitle}>
            {isLogin
              ? "Reprenez le contrôle de votre budget."
              : "Créez un espace budget qui vous ressemble."}
          </h1>
          <p style={styles.heroSubtitle}>
            {isLogin
              ? "Retrouvez vos transactions, vos totaux et votre historique dans une interface pensée pour aller vite."
              : "Commencez avec une expérience simple, élégante et branchée sur une vraie session utilisateur."}
          </p>
          <div style={styles.pills}>
            {["Vue claire", "Flux rapide", "Pages protégées"].map((label) => (
              <span key={label} style={styles.pill}>{label}</span>
            ))}
          </div>
        </section>

        {/* Flip card */}
        <section style={styles.cardOuter}>
          <div style={{
            ...styles.cardFlipper,
            height: isLogin ? 480 : 620,
            transform: isLogin ? "rotateY(0deg)" : "rotateY(180deg)",
          }}>
            {/* Login face */}
            <article style={{ ...styles.cardFace, ...styles.cardFaceFront }}>
              <AuthForm
                active={isLogin}
                email={email}
                errorMessage={isLogin ? errorMessage : null}
                isSubmitting={isSubmitting}
                mode="login"
                onEmailChange={setEmail}
                onNameChange={setName}
                onPasswordChange={setPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onSubmit={handleSubmit}
                password={password}
                name={name}
                confirmPassword={confirmPassword}
              />
            </article>
            {/* Register face */}
            <article style={{ ...styles.cardFace, ...styles.cardFaceBack }}>
              <AuthForm
                active={!isLogin}
                email={email}
                errorMessage={!isLogin ? errorMessage : null}
                isSubmitting={isSubmitting}
                mode="register"
                onEmailChange={setEmail}
                onNameChange={setName}
                onPasswordChange={setPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onSubmit={handleSubmit}
                password={password}
                name={name}
                confirmPassword={confirmPassword}
              />
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

interface AuthFormProps {
  active: boolean;
  confirmPassword: string;
  email: string;
  errorMessage: string | null;
  isSubmitting: boolean;
  mode: AuthMode;
  name: string;
  onConfirmPasswordChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  password: string;
}

function AuthForm({
  active,
  confirmPassword,
  email,
  errorMessage,
  isSubmitting,
  mode,
  name,
  onConfirmPasswordChange,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onSubmit,
  password,
}: AuthFormProps) {
  const isLogin = mode === "login";

  return (
    <div style={{ ...styles.formInner, opacity: active ? 1 : 0.82 }}>
      <div style={styles.formHeader}>
        <p style={styles.formEyebrow}>
          {isLogin ? "Connexion" : "Création de compte"}
        </p>
        <h2 style={styles.formTitle}>
          {isLogin ? "Bon retour" : "Bienvenue"}
        </h2>
        <p style={styles.formSubtitle}>
          {isLogin
            ? "Connectez-vous pour retrouver vos chiffres et vos mouvements récents."
            : "Créez votre compte pour commencer à suivre vos dépenses et revenus."}
        </p>
      </div>

      <form onSubmit={onSubmit} style={styles.form}>
        {!isLogin && (
          <label style={styles.fieldLabel}>
            Nom complet
            <input
              required
              type="text"
              placeholder="Ricardo Silva"
              style={styles.input}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </label>
        )}

        <label style={styles.fieldLabel}>
          Email
          <input
            required
            type="email"
            placeholder="ricardo@test.com"
            style={styles.input}
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />
        </label>

        <label style={styles.fieldLabel}>
          Mot de passe
          <input
            required
            minLength={8}
            type="password"
            placeholder="••••••••"
            style={styles.input}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
          />
        </label>

        {!isLogin && (
          <label style={styles.fieldLabel}>
            Confirmer le mot de passe
            <input
              required
              minLength={8}
              type="password"
              placeholder="••••••••"
              style={styles.input}
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
            />
          </label>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            ...styles.submitBtn,
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? "progress" : "pointer",
          }}
        >
          {isSubmitting
            ? "Patientez..."
            : isLogin
              ? "Se connecter"
              : "Créer mon compte"}
        </button>

        {errorMessage && (
          <div style={styles.errorBox}>{errorMessage}</div>
        )}
      </form>

      <div style={styles.switchRow}>
        <span style={styles.switchText}>
          {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}
        </span>
        <Link href={isLogin ? "/register" : "/login"} style={styles.switchLink}>
          {isLogin ? "Créer un compte" : "Se connecter"}
        </Link>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    background: "linear-gradient(160deg, #07111f 0%, #0b1731 42%, #1f1025 100%)",
    color: "#f7fbff",
  },
  ambientBlue: {
    position: "fixed",
    top: "-100px",
    left: "-80px",
    width: "420px",
    height: "420px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(10,132,255,0.28) 0%, transparent 70%)",
    pointerEvents: "none",
    filter: "blur(40px)",
  },
  ambientCoral: {
    position: "fixed",
    bottom: "-100px",
    right: "-80px",
    width: "420px",
    height: "420px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(255,69,58,0.22) 0%, transparent 70%)",
    pointerEvents: "none",
    filter: "blur(40px)",
  },
  shell: {
    position: "relative",
    zIndex: 10,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 36,
    maxWidth: 860,
    margin: "0 auto",
    padding: "40px 20px 100px",
  },
  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 12,
  },
  eyebrow: {
    margin: 0,
    fontSize: "0.74rem",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(208,224,255,0.68)",
  },
  heroTitle: {
    margin: 0,
    fontSize: "clamp(2rem, 5vw, 3.4rem)",
    fontWeight: 900,
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
    maxWidth: "18ch",
  },
  heroSubtitle: {
    margin: 0,
    maxWidth: "42ch",
    fontSize: "1rem",
    lineHeight: 1.65,
    color: "rgba(227,236,255,0.72)",
  },
  pills: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 4,
  },
  pill: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: "0.8rem",
    color: "rgba(227,236,255,0.8)",
  },
  cardOuter: {
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
    perspective: "1600px",
  },
  cardFlipper: {
    position: "relative",
    width: "100%",
    transformStyle: "preserve-3d",
    transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1), height 400ms cubic-bezier(0.22, 1, 0.36, 1)",
  },
  cardFace: {
    position: "absolute",
    inset: 0,
    borderRadius: 34,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(15,23,42,0.72)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    boxShadow: "0 28px 64px rgba(0,0,0,0.42)",
    backfaceVisibility: "hidden",
    overflow: "hidden",
  },
  cardFaceFront: {
    transform: "rotateY(0deg)",
  },
  cardFaceBack: {
    transform: "rotateY(180deg)",
  },
  formInner: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "32px 28px",
    gap: 0,
    transition: "opacity 240ms ease",
  },
  formHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 24,
  },
  formEyebrow: {
    margin: 0,
    fontSize: "0.74rem",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(208,224,255,0.68)",
  },
  formTitle: {
    margin: 0,
    fontSize: "1.8rem",
    fontWeight: 700,
    letterSpacing: "-0.04em",
  },
  formSubtitle: {
    margin: 0,
    fontSize: "0.9rem",
    lineHeight: 1.6,
    color: "rgba(227,236,255,0.65)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  fieldLabel: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: "0.82rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    color: "rgba(208,224,255,0.75)",
  },
  input: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "11px 14px",
    color: "#f7fbff",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 150ms ease",
  },
  submitBtn: {
    marginTop: 4,
    padding: "13px 0",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(255,69,58,0.95), rgba(10,132,255,0.85))",
    color: "#fff",
    fontWeight: 700,
    fontSize: "1rem",
    border: "none",
    boxShadow: "0 14px 36px rgba(10,132,255,0.2)",
    transition: "opacity 150ms ease",
  },
  errorBox: {
    borderRadius: 12,
    padding: "12px 16px",
    background: "rgba(119,24,31,0.42)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,232,234,0.92)",
    fontSize: "0.88rem",
    lineHeight: 1.6,
  },
  switchRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginTop: "auto",
    paddingTop: 20,
    fontSize: "0.9rem",
  },
  switchText: {
    color: "rgba(208,224,255,0.6)",
  },
  switchLink: {
    fontWeight: 700,
    color: "#f7fbff",
  },
};
