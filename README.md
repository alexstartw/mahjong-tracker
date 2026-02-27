# 麻將記分系統 Mahjong Tracker

記錄麻將牌局結果、玩家積分與歷史紀錄的管理系統。

## 技術棧

| 類別 | 技術 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16.1.6 |
| 語言 | TypeScript | ^5 |
| UI | React | 19.2.3 |
| 樣式 | Tailwind CSS v4 | ^4 |
| 動畫 | Framer Motion | ^12 |
| 圖示 | Lucide React | ^0.575 |
| 資料庫 | Turso (LibSQL / SQLite) | — |
| ORM | Prisma | ^6 |
| 認證 | NextAuth.js v5 (Credentials) | ^5.0.0-beta |
| 密碼雜湊 | bcryptjs | ^3 |
| 測試 | Jest + Testing Library | ^29 |
| 套件管理 | pnpm | 10.28.2 |
| 部署 | Vercel | — |

---

## 專案架構

```
mahjong-tracker/
├── src/
│   ├── app/                        # Next.js App Router 頁面
│   │   ├── api/                    # API 路由 (REST)
│   │   │   ├── auth/[...nextauth]/ # NextAuth 端點
│   │   │   ├── players/            # 玩家 CRUD
│   │   │   ├── sessions/           # 牌局 CRUD
│   │   │   └── stats/              # 儀表板統計
│   │   ├── admin/                  # 後台管理 (需登入才能寫入)
│   │   │   ├── layout.tsx          # 共用 Sidebar
│   │   │   ├── page.tsx            # 統計儀表板
│   │   │   ├── players/            # 玩家管理
│   │   │   └── sessions/           # 牌局管理 / 新增
│   │   ├── calendar/               # 公開行事曆
│   │   ├── players/[id]/           # 公開玩家個人頁
│   │   └── login/                  # 登入頁
│   ├── components/                 # 共用元件
│   │   ├── AdminSidebar.tsx        # 左側導覽列
│   │   └── AdminNav.tsx            # 頂部導覽列
│   ├── lib/
│   │   ├── auth.ts                 # NextAuth 設定
│   │   ├── prisma.ts               # Prisma client (LibSQL adapter)
│   │   ├── calendar.ts             # 行事曆工具函式
│   │   └── utils.ts                # cn() 合併 class 工具
│   └── proxy.ts                    # Next.js Proxy (路由保護)
├── prisma/
│   ├── schema.prisma               # 資料庫 Schema
│   ├── migrations/                 # 遷移紀錄
│   └── seed.ts                     # 初始資料 (建立管理員帳號)
└── src/__tests__/                  # 單元測試
```

---

## 資料庫 Schema

```
User            玩家登入帳號 (管理員)
Player          麻將玩家 (可為訪客)
GameSession     單場牌局 (日期 / 場地 / 底注)
SessionPlayer   牌局結果 (玩家 × 場次，記錄輸贏金額)
```

**關聯：**
- `GameSession` 1 → N `SessionPlayer`
- `Player` 1 → N `SessionPlayer`
- `SessionPlayer` 刪除場次時 Cascade 刪除

每場牌局的 `amount` 總和必須為零（零和遊戲）。

---

## 資料流

```
瀏覽器
  │
  ├─ Server Component (page.tsx)
  │     └─ 直接呼叫 Prisma（server-side）
  │
  └─ Client Component (*Client.tsx)
        └─ fetch → API Route (/api/...)
                    └─ Prisma → Turso (LibSQL)
```

---

## 權限設計

| 功能 | 未登入 | 已登入 |
|------|--------|--------|
| 查看牌局列表 | ✅ | ✅ |
| 查看玩家資料 / 積分 | ✅ | ✅ |
| 行事曆 | ✅ | ✅ |
| 新增牌局 | ❌ | ✅ |
| 刪除牌局 | ❌ | ✅ |
| 新增 / 刪除玩家 | ❌ | ✅ |

後台路由 `/admin/sessions/new` 由 `src/proxy.ts` 保護，API 寫入端點在 server 端以 `auth()` 驗證。

---

## 本地開發

### 1. 安裝套件

```bash
pnpm install
```

### 2. 設定環境變數

複製並填入 `.env`：

```env
DATABASE_URL="file:./dev.db"
TURSO_DATABASE_URL="libsql://<database>.<org>.turso.io"
TURSO_AUTH_TOKEN="<your-token>"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. 初始化資料庫

```bash
# 建立 SQLite 本地資料庫並套用 schema
pnpm exec prisma migrate dev

# 建立管理員帳號 (admin@mahjong.local / admin123)
pnpm run db:seed
```

### 4. 啟動開發伺服器

```bash
pnpm dev
```

開啟 [http://localhost:3000](http://localhost:3000)

---

## 常用指令

```bash
pnpm dev              # 開發伺服器
pnpm build            # 生產建置 (prisma generate + next build)
pnpm test             # 執行單元測試
pnpm test:ci          # CI 測試 (含 coverage)
pnpm run db:migrate   # 建立 / 套用資料庫遷移
pnpm run db:seed      # 植入初始資料
pnpm run db:studio    # 開啟 Prisma Studio GUI
pnpm run lint         # ESLint 檢查
```

---

## 部署 (Vercel + Turso)

### 建立 Turso 資料庫

```bash
turso db create mahjong-tracker
turso db show mahjong-tracker   # 取得 URL
turso db tokens create mahjong-tracker  # 取得 Token
```

### 套用 Schema 至 Turso

```bash
turso db shell mahjong-tracker < prisma/migrations/<最新遷移>/migration.sql
```

### Vercel 環境變數

在 Vercel 專案 Settings → Environment Variables 加入：

```
TURSO_DATABASE_URL   libsql://...
TURSO_AUTH_TOKEN     eyJ...
NEXTAUTH_SECRET      <openssl rand -base64 32>
NEXTAUTH_URL         https://<your-domain>.vercel.app
DATABASE_URL         file:/tmp/prisma-generate.db
```

> `DATABASE_URL` 在 Vercel 上僅供 `prisma generate` 使用，不需指向真實資料庫。

---

## 測試

```bash
pnpm test             # 執行所有測試
pnpm test:ci          # CI 模式 (含 coverage 報告)
```

測試涵蓋：
- `auth.test.ts` — 密碼雜湊、受保護路由
- `calendar.test.ts` — 行事曆格式化、日期分組
- `players.test.ts` — 玩家輸入驗證、積分計算
- `sessions.test.ts` — 牌局驗證、零和檢查、日期格式
