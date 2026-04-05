import { Suspense } from "react";
import { AuthShell } from "../_components/auth-shell";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthShell mode="login" />
    </Suspense>
  );
}
