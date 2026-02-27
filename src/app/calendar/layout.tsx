import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export default async function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div
      className="flex flex-col md:flex-row h-screen overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <AdminSidebar user={session?.user} />
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-5xl mx-auto px-4 py-5 md:px-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
