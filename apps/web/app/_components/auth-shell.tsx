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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isLogin
            ? { email, password }
            : { email, name, password },
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
        error instanceof Error
          ? error.message
          : "Authentification impossible.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.ambientBlue} />
      <div style={styles.ambientRose} />
      <div style={styles.shell}>
        <section style={styles.hero}>
          <p style={styles.eyebrow}>Secure budget flow</p>
          <h1 style={styles.title}>
            {isLogin
              ? "Reprenez le contrôle de votre budget."
              : "Créez un espace budget qui vous ressemble."}
          </h1>
          <p style={styles.subtitle}>
            {isLogin
              ? "Retrouvez vos transactions, vos totaux et votre historique dans une interface pensée pour aller vite."
              : "Commencez avec une expérience simple, élégante et branchée sur une vraie session utilisateur."}
          </p>
          <div style={styles.heroBadges}>
            <span style={styles.badge}>Vue claire</span>
            <span style={styles.badge}>Flux rapide</span>
            <span style={styles.badge}>Pages protégées</span>
          </div>
        </section>

        <section style={styles.cardStage}>
          <div
            style={{
              ...styles.cardInner,
              transform: isLogin ? "rotateY(0deg)" : "rotateY(180deg)",
            }}
          >
            <article style={{ ...styles.cardFace, ...styles.cardFront }}>
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
            <article style={{ ...styles.cardFace, ...styles.cardBack }}>
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
    <div
      style={{
        ...styles.formWrap,
        opacity: active ? 1 : 0.82,
      }}
    >
      <div style={styles.formTop}>
        <p style={styles.formEyebrow}>
          {isLogin ? "Connexion" : "Création de compte"}
        </p>
        <h2 style={styles.formTitle}>{isLogin ? "Bon retour" : "Bienvenue"}</h2>
        <p style={styles.formSubtitle}>
          {isLogin
            ? "Connectez-vous pour retrouver vos chiffres et vos mouvements récents."
            : "Créez votre compte pour commencer à suivre vos dépenses et revenus."}
        </p>
      </div>

      <form onSubmit={onSubmit} style={styles.form}>
        {!isLogin ? (
          <label style={styles.field}>
            Nom complet
            <input
              required
              type="text"
              placeholder="Ricardo Silva"
              style={styles.input}
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
            />
          </label>
        ) : null}

        <label style={styles.field}>
          Email
          <input
            required
            type="email"
            placeholder="ricardo@test.com"
            style={styles.input}
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
          />
        </label>

        <label style={styles.field}>
          Mot de passe
          <input
            required
            minLength={8}
            type="password"
            placeholder="••••••••"
            style={styles.input}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        </label>

        {!isLogin ? (
          <label style={styles.field}>
            Confirmer le mot de passe
            <input
              required
              minLength={8}
              type="password"
              placeholder="••••••••"
              style={styles.input}
              value={confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
            />
          </label>
        ) : null}

        <button type="submit" style={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting
            ? "Patientez..."
            : isLogin
              ? "Se connecter"
              : "Créer mon compte"}
        </button>

        {errorMessage ? <div style={styles.errorBanner}>{errorMessage}</div> : null}
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
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(160deg, #07111f 0%, #0b1731 42%, #1f1025 100%)",
    color: "#f7fbff",
  },
  ambientBlue: {
    position: "fixed",
    top: "-5rem",
    left: "-4rem",
    width: "19rem",
    height: "19rem",
    borderRadius: "999px",
    background: "rgba(10, 132, 255, 0.28)",
    filter: "blur(56px)",
  },
  ambientRose: {
    position: "fixed",
    right: "-4rem",
    bottom: "10rem",
    width: "20rem",
    height: "20rem",
    borderRadius: "999px",
    background: "rgba(255, 69, 58, 0.24)",
    filter: "blur(60px)",
  },
  shell: {
    position: "relative",
    zIndex: 1,
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: "28px",
    alignItems: "center",
    maxWidth: "1120px",
    margin: "0 auto",
    padding: "40px 20px 72px",
  },
  hero: {
    display: "grid",
    gap: "14px",
    alignSelf: "center",
  },
  eyebrow: {
    margin: 0,
    color: "rgba(208, 224, 255, 0.72)",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontSize: "0.8rem",
  },
  title: {
    margin: 0,
    fontSize: "clamp(2.4rem, 6vw, 4.6rem)",
    lineHeight: 0.92,
    letterSpacing: "-0.06em",
  },
  subtitle: {
    margin: 0,
    maxWidth: "34rem",
    color: "rgba(227, 236, 255, 0.76)",
    lineHeight: 1.7,
  },
  heroBadges: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "8px",
  },
  badge: {
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(237, 243, 255, 0.82)",
    fontSize: "0.92rem",
  },
  cardStage: {
    perspective: "1600px",
    minHeight: "680px",
  },
  cardInner: {
    position: "relative",
    width: "100%",
    minHeight: "680px",
    transformStyle: "preserve-3d",
    transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
  },
  cardFace: {
    position: "absolute",
    inset: 0,
    borderRadius: "34px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(26px)",
    WebkitBackdropFilter: "blur(26px)",
    boxShadow: "0 24px 60px rgba(5, 10, 22, 0.26)",
    backfaceVisibility: "hidden",
    overflow: "hidden",
  },
  cardFront: {
    transform: "rotateY(0deg)",
  },
  cardBack: {
    transform: "rotateY(180deg)",
  },
  formWrap: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "28px",
    transition: "opacity 0.24s ease",
  },
  formTop: {
    display: "grid",
    gap: "8px",
    marginBottom: "22px",
  },
  formEyebrow: {
    margin: 0,
    color: "rgba(208, 224, 255, 0.72)",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontSize: "0.78rem",
  },
  formTitle: {
    margin: 0,
    fontSize: "2rem",
    letterSpacing: "-0.05em",
  },
  formSubtitle: {
    margin: 0,
    color: "rgba(227, 236, 255, 0.74)",
    lineHeight: 1.6,
  },
  form: {
    display: "grid",
    gap: "16px",
  },
  field: {
    display: "grid",
    gap: "8px",
    color: "rgba(240, 245, 255, 0.9)",
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(8, 14, 29, 0.38)",
    padding: "15px 16px",
    color: "#f7fbff",
    outline: "none",
    fontSize: "1rem",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  submitButton: {
    marginTop: "6px",
    border: "none",
    borderRadius: "18px",
    padding: "16px 18px",
    background:
      "linear-gradient(135deg, rgba(255, 69, 58, 0.96), rgba(10, 132, 255, 0.82))",
    color: "#fff",
    fontWeight: 700,
    fontSize: "1rem",
    cursor: "pointer",
    boxShadow: "0 18px 42px rgba(10, 132, 255, 0.18)",
    opacity: 1,
  },
  errorBanner: {
    borderRadius: "18px",
    padding: "14px 16px",
    background: "rgba(119, 24, 31, 0.42)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#ffe7e8",
    lineHeight: 1.6,
  },
  switchRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "auto",
    paddingTop: "20px",
    color: "rgba(227, 236, 255, 0.72)",
  },
  switchText: {
    fontSize: "0.94rem",
  },
  switchLink: {
    fontSize: "0.94rem",
    fontWeight: 700,
    color: "#fff",
  },
};
