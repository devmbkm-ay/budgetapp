"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type AuthMode = "login" | "register";

interface AuthShellProps {
  mode: AuthMode;
}

export function AuthShell({ mode }: AuthShellProps) {
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const isLogin = mode === "login";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInfoMessage("Le parcours visuel est prêt. Il ne reste plus qu'à brancher l'authentification backend.");
  };

  return (
    <main style={styles.page}>
      <div style={styles.ambientBlue} />
      <div style={styles.ambientRose} />
      <div style={styles.shell}>
        <section style={styles.hero}>
          <p style={styles.eyebrow}>Secure budget flow</p>
          <h1 style={styles.title}>
            {isLogin ? "Reprenez le controle de votre budget." : "Créez un espace budget qui vous ressemble."}
          </h1>
          <p style={styles.subtitle}>
            {isLogin
              ? "Retrouvez vos transactions, vos totaux et votre historique dans une interface pensée pour aller vite."
              : "Commencez avec une expérience simple, élégante et prête à accueillir votre futur backend d'authentification."}
          </p>
          <div style={styles.heroBadges}>
            <span style={styles.badge}>Vue claire</span>
            <span style={styles.badge}>Flux rapide</span>
            <span style={styles.badge}>Sécurité à brancher</span>
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
                mode="login"
                active={isLogin}
                infoMessage={isLogin ? infoMessage : null}
                onSubmit={handleSubmit}
              />
            </article>
            <article style={{ ...styles.cardFace, ...styles.cardBack }}>
              <AuthForm
                mode="register"
                active={!isLogin}
                infoMessage={!isLogin ? infoMessage : null}
                onSubmit={handleSubmit}
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
  infoMessage: string | null;
  mode: AuthMode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function AuthForm({ active, infoMessage, mode, onSubmit }: AuthFormProps) {
  const isLogin = mode === "login";

  return (
    <div
      style={{
        ...styles.formWrap,
        opacity: active ? 1 : 0.82,
      }}
    >
      <div style={styles.formTop}>
        <p style={styles.formEyebrow}>{isLogin ? "Connexion" : "Création de compte"}</p>
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
            <input type="text" placeholder="Ricardo Silva" style={styles.input} />
          </label>
        ) : null}

        <label style={styles.field}>
          Email
          <input type="email" placeholder="ricardo@test.com" style={styles.input} />
        </label>

        <label style={styles.field}>
          Mot de passe
          <input type="password" placeholder="••••••••" style={styles.input} />
        </label>

        {!isLogin ? (
          <label style={styles.field}>
            Confirmer le mot de passe
            <input type="password" placeholder="••••••••" style={styles.input} />
          </label>
        ) : null}

        <button type="submit" style={styles.submitButton}>
          {isLogin ? "Se connecter" : "Créer mon compte"}
        </button>

        {infoMessage ? <div style={styles.infoBanner}>{infoMessage}</div> : null}
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

const styles: Record<string, React.CSSProperties> = {
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
  },
  infoBanner: {
    borderRadius: "18px",
    padding: "14px 16px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(237, 243, 255, 0.84)",
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
