import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-bi-gray">
      <Sidebar userRole={session.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName={session.name} userRole={session.role} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
