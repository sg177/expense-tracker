import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const isAdmin = user.id === process.env.ADMIN_USER_ID;

  return (
    <div className="flex">
      <Sidebar isAdmin={isAdmin} firstName={user.firstName ?? "User"} />
      <main className="ml-64 flex-1 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  );
}