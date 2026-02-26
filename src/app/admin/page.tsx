import { auth } from "@/lib/auth";

export default async function AdminPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">後台總覽</h1>
      <p className="text-gray-500">歡迎回來，{session?.user?.name ?? "管理員"}</p>
    </div>
  );
}
