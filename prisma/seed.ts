import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@mahjong.local" },
    update: {},
    create: {
      name: "管理員",
      email: "admin@mahjong.local",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("✅ 預設管理員帳號建立完成");
  console.log("   Email: admin@mahjong.local");
  console.log("   Password: admin123");
  console.log("   ⚠️  請登入後立即修改密碼");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
