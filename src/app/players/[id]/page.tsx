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
    <div className="min-h-screen" style={{ background: "#0b1a10" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b" style={{ background: "#0b1a1099", borderColor: "#2a4530", backdropFilter: "blur(12px)" }}>
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/calendar" className="flex items-center gap-2 text-sm" style={{ color: "#a89b7e" }}>
            <span>←</span> <span>行事曆</span>
          </Link>
          <span className="font-bold" style={{ color: "#c9a84c", fontFamily: "var(--font-playfair)" }}>
            🀄 麻將記錄
          </span>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Player hero */}
        <div className="card-gold p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl mb-4"
            style={{ background: "#1a2e20", border: "2px solid #c9a84c40" }}>
            🀄
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair)", color: "#c9a84c" }}>
            {player.name}
          </h1>
          {player.isGuest && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#2a4530", color: "#a89b7e" }}>
              臨時玩家
            </span>
          )}
          <div className="mt-6">
            <div className={`text-5xl font-bold ${isPositive ? "glow-win" : isNegative ? "glow-loss" : ""}`}
              style={{
                fontFamily: "var(--font-playfair)",
                color: isPositive ? "#4ade80" : isNegative ? "#f87171" : "#a89b7e",
              }}>
              {isPositive ? "+" : ""}{player.totalAmount.toLocaleString()}
            </div>
            <div className="text-sm mt-1" style={{ color: "#a89b7e" }}>累積輸贏</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "總場次", value: player.sessionCount, unit: "場" },
            { label: "勝率", value: `${player.winRate}`, unit: "%" },
            { label: "最佳", value: `+${player.bestWin.toLocaleString()}`, color: "#4ade80" },
            { label: "最差", value: player.worstLoss.toLocaleString(), color: "#f87171" },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair)", color: stat.color ?? "#c9a84c" }}>
                {stat.value}<span className="text-base">{stat.unit}</span>
              </div>
              <div className="text-xs mt-1" style={{ color: "#a89b7e" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Win/Loss breakdown */}
        <div className="card p-6">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold glow-win" style={{ color: "#4ade80", fontFamily: "var(--font-playfair)" }}>{player.wins}</div>
              <div className="text-xs mt-1" style={{ color: "#a89b7e" }}>贏</div>
            </div>
            <div style={{ width: "1px", background: "#2a4530" }} />
            <div>
              <div className="text-2xl font-bold" style={{ color: "#a89b7e", fontFamily: "var(--font-playfair)" }}>{player.draws}</div>
              <div className="text-xs mt-1" style={{ color: "#a89b7e" }}>平</div>
            </div>
            <div style={{ width: "1px", background: "#2a4530" }} />
            <div>
              <div className="text-2xl font-bold glow-loss" style={{ color: "#f87171", fontFamily: "var(--font-playfair)" }}>{player.losses}</div>
              <div className="text-xs mt-1" style={{ color: "#a89b7e" }}>輸</div>
            </div>
          </div>
        </div>

        {/* Recent sessions */}
        {player.recentSessions.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b" style={{ borderColor: "#2a4530" }}>
              <h2 className="font-semibold" style={{ color: "#c9a84c", fontFamily: "var(--font-playfair)" }}>近期戰績</h2>
            </div>
            <div className="divide-y" style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}>
              {player.recentSessions.map((s) => {
                const isWin = s.amount > 0;
                const isLoss = s.amount < 0;
                return (
                  <div key={s.id} className="px-6 py-4 flex items-center justify-between" style={{ borderColor: "#2a4530" }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: "#f0ead8" }}>
                        {new Date(s.date).toLocaleDateString("zh-TW", { month: "long", day: "numeric" })}
                        <span className="ml-2 text-xs" style={{ color: "#a89b7e" }}>📍 {s.venue}</span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "#4a4335" }}>{s.stakes}</div>
                    </div>
                    <div
                      className={`text-lg font-bold ${isWin ? "glow-win" : isLoss ? "glow-loss" : ""}`}
                      style={{
                        fontFamily: "var(--font-playfair)",
                        color: isWin ? "#4ade80" : isLoss ? "#f87171" : "#a89b7e",
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
