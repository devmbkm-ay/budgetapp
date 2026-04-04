"use client";

import type { CSSProperties } from "react";
import { useEffect } from "react";

interface ConfirmDialogProps {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  isBusy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}

export function ConfirmDialog({
  cancelLabel = "Annuler",
  confirmLabel = "Confirmer",
  description,
  isBusy = false,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isBusy, onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      role="dialog"
      style={styles.overlay}
      onClick={() => {
        if (!isBusy) {
          onCancel();
        }
      }}
    >
      <div
        style={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={styles.halo} />
        <p style={styles.eyebrow}>Confirmation</p>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.description}>{description}</p>
        <div style={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            style={{
              ...styles.cancelButton,
              cursor: isBusy ? "default" : "pointer",
              opacity: isBusy ? 0.6 : 1,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            style={{
              ...styles.confirmButton,
              cursor: isBusy ? "progress" : "pointer",
              opacity: isBusy ? 0.8 : 1,
            }}
          >
            {isBusy ? "Suppression..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "rgba(3, 7, 18, 0.62)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },
  dialog: {
    position: "relative",
    overflow: "hidden",
    width: "min(460px, 100%)",
    borderRadius: "28px",
    padding: "24px",
    background: "linear-gradient(180deg, rgba(17, 25, 45, 0.96), rgba(30, 16, 31, 0.96))",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.12)",
    boxShadow: "0 28px 80px rgba(0, 0, 0, 0.42)",
    color: "#f7fbff",
  },
  halo: {
    position: "absolute",
    top: "-64px",
    right: "-48px",
    width: "180px",
    height: "180px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(255, 142, 135, 0.22) 0%, rgba(255,255,255,0) 70%)",
    pointerEvents: "none",
  },
  eyebrow: {
    position: "relative",
    margin: 0,
    color: "rgba(208, 224, 255, 0.68)",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontSize: "0.74rem",
  },
  title: {
    position: "relative",
    margin: "10px 0 8px",
    fontSize: "1.7rem",
    lineHeight: 1,
    letterSpacing: "-0.04em",
  },
  description: {
    position: "relative",
    margin: 0,
    color: "rgba(227, 236, 255, 0.76)",
    lineHeight: 1.7,
  },
  actions: {
    position: "relative",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "24px",
    flexWrap: "wrap",
  },
  cancelButton: {
    padding: "12px 18px",
    borderRadius: "999px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#f7fbff",
    fontWeight: 700,
  },
  confirmButton: {
    padding: "12px 18px",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, rgba(255, 142, 135, 0.96), rgba(255, 69, 58, 0.88))",
    color: "#fff7f7",
    fontWeight: 700,
    boxShadow: "0 16px 32px rgba(255, 69, 58, 0.24)",
  },
};
