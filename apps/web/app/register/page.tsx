import { Suspense } from "react";
import { AuthShell } from "../_components/auth-shell";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthShell mode="register" />
    </Suspense>
  );
}
