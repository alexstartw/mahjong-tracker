import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

async function getPlayerProfile(id: string) {
  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      sessions: {
        include: { session: true },
        orderBy: { session: { date: "desc" } },
      },
    },
  });
  if (!player) return null;

  const totalAmount = player.sessions.reduce((s, sp) => s + sp.amount, 0);
  const wins = player.sessions.filter((sp) => sp.amount > 0).length;
  const losses = player.sessions.filter((sp) => sp.amount < 0).length;
  const draws = player.sessions.filter((sp) => sp.amount === 0).length;

  return {
    id: player.id,
    name: player.name,
    isGuest: player.isGuest,
    totalAmount,
    sessionCount: player.sessions.length,
    wins,
    losses,
    draws,
    winRate: player.sessions.length > 0
      ? Math.round((wins / player.sessions.length) * 100)
      : 0,
    bestWin: player.sessions.length > 0
      ? Math.max(...player.sessions.map((sp) => sp.amount))
      : 0,
    worstLoss: player.sessions.length > 0
      ? Math.min(...player.sessions.map((sp) => sp.amount))
      : 0,
    recentSessions: player.sessions.slice(0, 20).map((sp) => ({
      id: sp.session.id,
      date: sp.session.date.toISOString(),
      venue: sp.session.venue,
      stakes: sp.session.stakes,
      amount: sp.amount,
    })),
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlayerProfilePage({ params }: Props) {
  const { id } = await params;
  const player = await getPlayerProfile(id);
  if (!player) notFound();

  const isPositive = player.totalAmount > 0;
  const isNegative = player.totalAmount < 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b" style={{ background: "color-mix(in srgb, var(--background) 85%, transparent)", borderColor: "var(--border)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/calendar" className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <span>←</span> <span>行事曆</span>
          </Link>
          <span className="font-bold" style={{ color: "var(--primary)", fontFamily: "var(--font-serif)" }}>
            🀄 麻將記錄
          </span>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Player hero */}
        <div className="card-primary p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl mb-4"
            style={{ background: "var(--muted)", border: "2px solid color-mix(in srgb, var(--primary) 25%, transparent)" }}>
            🀄
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-serif)", color: "var(--primary)" }}>
            {player.name}
          </h1>
          {player.isGuest && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
              臨時玩家
            </span>
          )}
          <div className="mt-6">
            <div className="text-5xl font-bold"
              style={{
                fontFamily: "var(--font-serif)",
                color: isPositive ? "var(--win)" : isNegative ? "var(--loss)" : "var(--muted-foreground)",
              }}>
              {isPositive ? "+" : ""}{player.totalAmount.toLocaleString()}
            </div>
            <div className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>累積輸贏</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "總場次", value: player.sessionCount, unit: "場" },
            { label: "勝率", value: `${player.winRate}`, unit: "%" },
            { label: "最佳", value: `+${player.bestWin.toLocaleString()}`, color: "var(--win)" },
            { label: "最差", value: player.worstLoss.toLocaleString(), color: "var(--loss)" },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)", color: stat.color ?? "var(--primary)" }}>
                {stat.value}<span className="text-base">{"unit" in stat ? stat.unit : ""}</span>
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Win/Loss breakdown */}
        <div className="card p-6">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold" style={{ color: "var(--win)", fontFamily: "var(--font-serif)" }}>{player.wins}</div>
              <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>贏</div>
            </div>
            <div style={{ width: "1px", background: "var(--border)" }} />
            <div>
              <div className="text-2xl font-bold" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-serif)" }}>{player.draws}</div>
              <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>平</div>
            </div>
            <div style={{ width: "1px", background: "var(--border)" }} />
            <div>
              <div className="text-2xl font-bold" style={{ color: "var(--loss)", fontFamily: "var(--font-serif)" }}>{player.losses}</div>
              <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>輸</div>
            </div>
          </div>
        </div>

        {/* Recent sessions */}
        {player.recentSessions.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="font-semibold" style={{ color: "var(--primary)", fontFamily: "var(--font-serif)" }}>近期戰績</h2>
            </div>
            <div className="divide-y" style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}>
              {player.recentSessions.map((s) => {
                const isWin = s.amount > 0;
                const isLoss = s.amount < 0;
                return (
                  <div key={s.id} className="px-6 py-4 flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {new Date(s.date).toLocaleDateString("zh-TW", { month: "long", day: "numeric" })}
                        <span className="ml-2 text-xs" style={{ color: "var(--muted-foreground)" }}>📍 {s.venue}</span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.stakes}</div>
                    </div>
                    <div
                      className="text-lg font-bold"
                      style={{
                        fontFamily: "var(--font-serif)",
                        color: isWin ? "var(--win)" : isLoss ? "var(--loss)" : "var(--muted-foreground)",
                      }}
                    >
                      {isWin ? "+" : ""}{s.amount.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
