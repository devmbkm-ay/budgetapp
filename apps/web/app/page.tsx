import { redirect } from "next/navigation";

// Mark this route as dynamic to prevent static generation issues
export const dynamic = 'force-dynamic';

export default function HomePage() {
  redirect("/transactions");
}
