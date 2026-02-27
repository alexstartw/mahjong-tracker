import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    winRate:
      player.sessions.length > 0
        ? Math.round((wins / player.sessions.length) * 100)
        : 0,
    bestWin:
      player.sessions.length > 0
        ? Math.max(...player.sessions.map((sp) => sp.amount))
        : 0,
    worstLoss:
      player.sessions.length > 0
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

  const isPos = player.totalAmount > 0;
  const isNeg = player.totalAmount < 0;
  const totalColor = isPos
    ? "var(--win)"
    : isNeg
      ? "var(--loss)"
      : "var(--muted-foreground)";

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{
          background: "color-mix(in srgb, var(--background) 85%, transparent)",
          borderColor: "var(--border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/calendar"
            className="link-muted flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft size={14} /> 行事曆
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-base">🀄</span>
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              麻將記錄
            </span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Hero card */}
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1
                  className="text-2xl font-semibold tracking-tight"
                  style={{ color: "var(--foreground)" }}
                >
                  {player.name}
                </h1>
                {player.isGuest && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: "var(--muted)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    臨時
                  </span>
                )}
              </div>
              <p
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                {player.sessionCount} 場 · 勝率 {player.winRate}%
              </p>
            </div>

            <div className="text-right">
              <p
                className="text-3xl font-semibold tabular"
                style={{ color: totalColor }}
              >
                {isPos ? "+" : ""}
                {player.totalAmount.toLocaleString()}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--muted-foreground)" }}
              >
                累積輸贏
              </p>
            </div>
          </div>

          {/* W/D/L bar */}
          <div
            className="mt-5 pt-5"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div className="grid grid-cols-3 text-center gap-2">
              {[
                { label: "贏", value: player.wins, color: "var(--win)" },
                {
                  label: "平",
                  value: player.draws,
                  color: "var(--muted-foreground)",
                },
                { label: "輸", value: player.losses, color: "var(--loss)" },
              ].map((s) => (
                <div key={s.label}>
                  <p
                    className="text-xl font-semibold tabular"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "總場次",
              value: player.sessionCount,
              suffix: "場",
              color: "var(--foreground)",
            },
            {
              label: "勝率",
              value: player.winRate,
              suffix: "%",
              color: "var(--foreground)",
            },
            {
              label: "最佳",
              value: `+${player.bestWin.toLocaleString()}`,
              color: "var(--win)",
            },
            {
              label: "最差",
              value: player.worstLoss.toLocaleString(),
              color: "var(--loss)",
            },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <p
                className="text-xl font-semibold tabular"
                style={{ color: s.color }}
              >
                {s.value}
                {"suffix" in s && (
                  <span
                    className="text-sm font-normal ml-0.5"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {s.suffix}
                  </span>
                )}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--muted-foreground)" }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Recent sessions */}
        {player.recentSessions.length > 0 && (
          <div className="card overflow-hidden">
            <div
              className="px-5 py-3.5"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: "var(--foreground)" }}
              >
                近期戰績
              </p>
            </div>
            <div>
              {player.recentSessions.map((s, i) => {
                const isWin = s.amount > 0;
                const isLoss = s.amount < 0;
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-5 py-3"
                    style={{
                      borderBottom:
                        i < player.recentSessions.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center w-8">
                        <p
                          className="text-sm font-medium tabular leading-none"
                          style={{ color: "var(--foreground)" }}
                        >
                          {new Date(s.date).getUTCDate()}
                        </p>
                        <p
                          className="text-[10px] mt-0.5"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {new Date(s.date).toLocaleDateString("zh-TW", {
                            month: "short",
                            timeZone: "UTC",
                          })}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--foreground)" }}
                        >
                          {s.venue}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {s.stakes}
                        </p>
                      </div>
                    </div>
                    <p
                      className="text-base font-semibold tabular"
                      style={{
                        color: isWin
                          ? "var(--win)"
                          : isLoss
                            ? "var(--loss)"
                            : "var(--muted-foreground)",
                      }}
                    >
                      {isWin ? "+" : ""}
                      {s.amount.toLocaleString()}
                    </p>
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
