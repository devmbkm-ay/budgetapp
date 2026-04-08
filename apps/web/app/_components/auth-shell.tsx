"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

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
    <main className="min-h-screen relative overflow-hidden" style={{
      background: "linear-gradient(160deg, #07111f 0%, #0b1731 42%, #1f1025 100%)",
      color: "#f7fbff",
    }}>
      <div
        className="fixed -top-20 -left-16 w-80 h-80 rounded-full filter blur-3xl"
        style={{ background: "rgba(10, 132, 255, 0.28)" }}
      />
      <div
        className="fixed -bottom-20 -right-16 w-80 h-80 rounded-full filter blur-3xl"
        style={{ background: "rgba(255, 69, 58, 0.24)" }}
      />
      <div className="relative z-10 min-h-screen flex flex-col justify-center gap-10 max-w-4xl mx-auto px-5 pb-20">
        <section className="grid gap-3.5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
            Secure budget flow
          </p>
          <h1 className="text-5xl font-black leading-tight -tracking-wide">
            {isLogin
              ? "Reprenez le contrôle de votre budget."
              : "Créez un espace budget qui vous ressemble."}
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-secondary">
            {isLogin
              ? "Retrouvez vos transactions, vos totaux et votre historique dans une interface pensée pour aller vite."
              : "Commencez avec une expérience simple, élégante et branchée sur une vraie session utilisateur."}
          </p>
          <div className="flex gap-2.5 justify-center flex-wrap mt-2">
            <span className="px-3.5 py-2.5 rounded-full bg-white/8 border border-white/12 text-xs">
              Vue claire
            </span>
            <span className="px-3.5 py-2.5 rounded-full bg-white/8 border border-white/12 text-xs">
              Flux rapide
            </span>
            <span className="px-3.5 py-2.5 rounded-full bg-white/8 border border-white/12 text-xs">
              Pages protégées
            </span>
          </div>
        </section>

        <section className="w-full max-w-xl mx-auto" style={{ perspective: "1600px" }}>
          <div style={{
            position: "relative",
            width: "100%",
            minHeight: "680px",
            transformStyle: "preserve-3d",
            transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
            transform: isLogin ? "rotateY(0deg)" : "rotateY(180deg)",
          }}>
            <article style={{
              position: "absolute",
              inset: 0,
              borderRadius: "34px",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4)",
              backfaceVisibility: "hidden",
              overflow: "hidden",
              transform: "rotateY(0deg)",
            }}>
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
            <article style={{
              position: "absolute",
              inset: 0,
              borderRadius: "34px",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4)",
              backfaceVisibility: "hidden",
              overflow: "hidden",
              transform: "rotateY(180deg)",
            }}>
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
      className="flex flex-col h-full p-7 transition-opacity duration-240"
      style={{ opacity: active ? 1 : 0.82 }}
    >
      <div className="grid gap-2 mb-5.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
          {isLogin ? "Connexion" : "Création de compte"}
        </p>
        <h2 className="text-2xl font-bold tracking-tight">
          {isLogin ? "Bon retour" : "Bienvenue"}
        </h2>
        <p className="text-sm leading-relaxed text-secondary">
          {isLogin
            ? "Connectez-vous pour retrouver vos chiffres et vos mouvements récents."
            : "Créez votre compte pour commencer à suivre vos dépenses et revenus."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        {!isLogin ? (
          <div className="form-group">
            <label className="form-label">Nom complet</label>
            <input
              required
              type="text"
              placeholder="Ricardo Silva"
              className="input input-md"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
            />
          </div>
        ) : null}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            required
            type="email"
            placeholder="ricardo@test.com"
            className="input input-md"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mot de passe</label>
          <input
            required
            minLength={8}
            type="password"
            placeholder="••••••••"
            className="input input-md"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        </div>

        {!isLogin ? (
          <div className="form-group">
            <label className="form-label">Confirmer le mot de passe</label>
            <input
              required
              minLength={8}
              type="password"
              placeholder="••••••••"
              className="input input-md"
              value={confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
            />
          </div>
        ) : null}

        <button
          type="submit"
          className="btn btn-primary mt-1.5"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Patientez..."
            : isLogin
              ? "Se connecter"
              : "Créer mon compte"}
        </button>

        {errorMessage ? (
          <div className="rounded-lg px-4 py-3.5 bg-red-950/42 border border-white/12 text-red-100/90 text-sm leading-relaxed">
            {errorMessage}
          </div>
        ) : null}
      </form>

      <div className="flex gap-2 flex-wrap mt-auto pt-5 text-sm text-secondary">
        <span>
          {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}
        </span>
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-bold text-white"
        >
          {isLogin ? "Créer un compte" : "Se connecter"}
        </Link>
      </div>
    </div>
  );
}
