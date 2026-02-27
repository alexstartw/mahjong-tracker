import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Plus } from "lucide-react";

async function getStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalPlayers, totalSessions, thisMonthSessions, playerStats, recentSessions] =
    await Promise.all([
      prisma.player.count(),
      prisma.gameSession.count(),
      prisma.gameSession.count({ where: { date: { gte: monthStart } } }),
      prisma.sessionPlayer.groupBy({
        by: ["playerId"],
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 5,
      }),
      prisma.gameSession.findMany({
        take: 5,
        orderBy: { date: "desc" },
        include: { players: { include: { player: true } } },
      }),
    ]);

  const playerIds = playerStats.map((p) => p.playerId);
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    select: { id: true, name: true },
  });
  const playerMap = new Map(players.map((p) => [p.id, p.name]));
  const ranked = playerStats.map((p) => ({
    id: p.playerId,
    name: playerMap.get(p.playerId) ?? "未知",
    total: p._sum.amount ?? 0,
  }));

  return {
    totalPlayers,
    totalSessions,
    thisMonthSessions,
    topWinner: ranked[0] ?? null,
    recentSessions: recentSessions.map((s) => ({
      id: s.id,
      date: s.date.toISOString(),
      venue: s.venue,
      stakes: s.stakes,
      players: s.players
        .map((sp) => ({ id: sp.playerId, name: sp.player.name, amount: sp.amount }))
        .sort((a, b) => b.amount - a.amount),
    })),
  };
}

export default async function AdminPage() {
  const [session, stats] = await Promise.all([auth(), getStats()]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "早安" : hour < 18 ? "午安" : "晚安";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm mb-0.5" style={{ color: "var(--muted-foreground)" }}>
            {greeting}，{session?.user?.name ?? "管理員"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
            總覽
          </h1>
        </div>
        <Link href="/admin/sessions/new" className="btn-primary">
          <Plus size={14} /> 新增牌局
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "累積場次",   value: stats.totalSessions,     suffix: "場" },
          { label: "本月場次",   value: stats.thisMonthSessions,  suffix: "場" },
          { label: "玩家人數",   value: stats.totalPlayers,       suffix: "人" },
          {
            label: "累積最佳",
            value: stats.topWinner?.name ?? "—",
            sub: stats.topWinner && stats.topWinner.total !== 0
              ? `+${stats.topWinner.total.toLocaleString()}`
              : null,
          },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
            {"suffix" in s ? (
              <p className="text-3xl font-semibold tabular" style={{ color: "var(--foreground)" }}>
                {s.value}
                <span className="text-base font-normal ml-1" style={{ color: "var(--muted-foreground)" }}>{s.suffix}</span>
              </p>
            ) : (
              <div>
                <p className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>{s.value}</p>
                {s.sub && <p className="text-sm mt-0.5 tabular font-medium" style={{ color: "var(--win)" }}>{s.sub}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent sessions */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>最近牌局</p>
          <Link href="/admin/sessions" className="text-xs transition-colors" style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--foreground)")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--muted-foreground)")}>
            全部 →
          </Link>
        </div>

        {stats.recentSessions.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>尚無牌局記錄</p>
            <Link href="/admin/sessions/new" className="btn-primary text-sm">
              <Plus size={14} /> 新增第一場
            </Link>
          </div>
        ) : (
          <div>
            {stats.recentSessions.map((s, i) => {
              const winners = s.players.filter((p) => p.amount > 0);
              const losers  = s.players.filter((p) => p.amount < 0);
              return (
                <div
                  key={s.id}
                  className="flex items-start gap-5 px-5 py-3.5"
                  style={{ borderBottom: i < stats.recentSessions.length - 1 ? "1px solid var(--border)" : "none" }}
                >
                  {/* Date */}
                  <div className="shrink-0 w-10 text-center">
                    <p className="text-lg font-semibold tabular leading-none" style={{ color: "var(--foreground)" }}>
                      {new Date(s.date).getUTCDate()}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(s.date).toLocaleDateString("zh-TW", { month: "short", timeZone: "UTC" })}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{s.venue}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                        {s.stakes}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {winners.map((p) => (
                        <Link key={p.id} href={`/players/${p.id}`}
                          className="flex items-center gap-1.5 text-xs hover:opacity-70 transition-opacity">
                          <span style={{ color: "var(--muted-foreground)" }}>{p.name}</span>
                          <span className="font-semibold tabular" style={{ color: "var(--win)" }}>+{p.amount.toLocaleString()}</span>
                        </Link>
                      ))}
                      {losers.map((p) => (
                        <Link key={p.id} href={`/players/${p.id}`}
                          className="flex items-center gap-1.5 text-xs hover:opacity-70 transition-opacity">
                          <span style={{ color: "var(--muted-foreground)" }}>{p.name}</span>
                          <span className="font-semibold tabular" style={{ color: "var(--loss)" }}>{p.amount.toLocaleString()}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
