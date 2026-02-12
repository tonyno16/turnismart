import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireRole(["admin"]);
  } catch {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
