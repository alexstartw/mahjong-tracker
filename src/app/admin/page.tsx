import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";

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
    topLoser: ranked[ranked.length - 1] ?? null,
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
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm mb-1" style={{ color: "#a89b7e" }}>
            {greeting}，{session?.user?.name ?? "管理員"}
          </p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-playfair)", color: "#c9a84c" }}>
            牌局總覽
          </h1>
        </div>
        <Link href="/admin/sessions/new" className="btn-gold px-6 py-3 text-sm">
          + 新增牌局
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "累積場次", value: stats.totalSessions, unit: "場", accent: "#c9a84c" },
          { label: "本月場次", value: stats.thisMonthSessions, unit: "場", accent: "#e8c96d" },
          { label: "玩家人數", value: stats.totalPlayers, unit: "人", accent: "#a89b7e" },
          {
            label: "本月最佳",
            value: stats.topWinner?.name ?? "—",
            sub: stats.topWinner ? `+${stats.topWinner.total.toLocaleString()}` : "",
            accent: "#4ade80",
          },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#4a4335" }}>
              {stat.label}
            </p>
            {"unit" in stat ? (
              <p className="text-4xl font-bold" style={{ fontFamily: "var(--font-playfair)", color: stat.accent }}>
                {stat.value}
                <span className="text-lg ml-1" style={{ color: "#a89b7e" }}>{stat.unit}</span>
              </p>
            ) : (
              <div>
                <p className="text-xl font-bold" style={{ fontFamily: "var(--font-playfair)", color: stat.accent }}>
                  {stat.value}
                </p>
                {stat.sub && (
                  <p className="text-sm mt-1 glow-win" style={{ color: "#4ade80" }}>{stat.sub}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent sessions */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b" style={{ borderColor: "#2a4530" }}>
          <h2 className="font-semibold" style={{ fontFamily: "var(--font-playfair)", color: "#c9a84c" }}>
            最近牌局
          </h2>
          <Link href="/admin/sessions" className="text-xs" style={{ color: "#a89b7e" }}>
            查看全部 →
          </Link>
        </div>

        {stats.recentSessions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="mb-4" style={{ color: "#4a4335" }}>尚無牌局記錄</p>
            <Link href="/admin/sessions/new" className="btn-gold text-sm px-5 py-2">
              開始記錄
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#2a4530" }}>
            {stats.recentSessions.map((s) => {
              const winners = s.players.filter((p) => p.amount > 0);
              const losers = s.players.filter((p) => p.amount < 0);
              return (
                <div key={s.id} className="px-6 py-4 flex items-start gap-6">
                  <div className="shrink-0 text-center w-12">
                    <p className="text-lg font-bold" style={{ fontFamily: "var(--font-playfair)", color: "#c9a84c" }}>
                      {new Date(s.date).getUTCDate()}
                    </p>
                    <p className="text-xs" style={{ color: "#4a4335" }}>
                      {new Date(s.date).toLocaleDateString("zh-TW", { month: "short", timeZone: "UTC" })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium" style={{ color: "#f0ead8" }}>📍 {s.venue}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#1a2e20", color: "#a89b7e" }}>
                        {s.stakes}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div className="space-y-0.5">
                        {winners.map((p) => (
                          <Link key={p.id} href={`/players/${p.id}`}
                            className="flex items-center gap-2 text-xs hover:opacity-80 transition-opacity">
                            <span style={{ color: "#a89b7e" }}>{p.name}</span>
                            <span className="glow-win font-semibold" style={{ color: "#4ade80" }}>+{p.amount.toLocaleString()}</span>
                          </Link>
                        ))}
                      </div>
                      <div className="space-y-0.5">
                        {losers.map((p) => (
                          <Link key={p.id} href={`/players/${p.id}`}
                            className="flex items-center gap-2 text-xs hover:opacity-80 transition-opacity">
                            <span style={{ color: "#a89b7e" }}>{p.name}</span>
                            <span className="glow-loss font-semibold" style={{ color: "#f87171" }}>{p.amount.toLocaleString()}</span>
                          </Link>
                        ))}
                      </div>
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
