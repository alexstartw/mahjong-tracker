"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";

interface SessionPlayer {
  id: string;
  playerId: string;
  name: string;
  amount: number;
}

interface Session {
  id: string;
  date: string;
  venue: string;
  stakes: string;
  note: string | null;
  players: SessionPlayer[];
}

export default function SessionsClient({ initialSessions }: { initialSessions: Session[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("確定要刪除這場牌局記錄？")) return;
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (initialSessions.length === 0) {
    return (
      <div className="card p-16 text-center">
        <p className="text-4xl mb-3">🀄</p>
        <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>尚無牌局記錄</p>
        <Link href="/admin/sessions/new" className="btn-primary text-sm">
          記錄第一場
        </Link>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {initialSessions.map((session, i) => {
        const date    = new Date(session.date);
        const winners = session.players.filter((p) => p.amount > 0).sort((a, b) => b.amount - a.amount);
        const losers  = session.players.filter((p) => p.amount < 0).sort((a, b) => a.amount - b.amount);
        const isLast  = i === initialSessions.length - 1;

        return (
          <div
            key={session.id}
            className="flex items-start gap-5 px-5 py-4 group transition-colors"
            style={{
              borderBottom: isLast ? "none" : "1px solid var(--border)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {/* Date */}
            <div className="shrink-0 w-10 text-center pt-0.5">
              <p className="text-xl font-semibold tabular leading-none" style={{ color: "var(--foreground)" }}>
                {date.getUTCDate()}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                {date.toLocaleDateString("zh-TW", { month: "short", timeZone: "UTC" })}
              </p>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{session.venue}</span>
                <span className="text-xs px-1.5 py-0.5 rounded"
                  style={{ background: "var(--accent)", color: "var(--muted-foreground)" }}>
                  {session.stakes}
                </span>
                {session.note && (
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{session.note}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2.5" style={{ borderTop: "1px solid var(--border)" }}>
                {/* Winners */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-foreground)" }}>贏</p>
                  <div className="space-y-1">
                    {winners.length === 0
                      ? <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>
                      : winners.map((p) => (
                          <Link key={p.id} href={`/players/${p.playerId}`}
                            className="flex items-center justify-between group/row hover:opacity-70 transition-opacity">
                            <span className="text-xs group-hover/row:underline" style={{ color: "var(--muted-foreground)" }}>{p.name}</span>
                            <span className="text-xs font-semibold tabular" style={{ color: "var(--win)" }}>+{p.amount.toLocaleString()}</span>
                          </Link>
                        ))
                    }
                  </div>
                </div>
                {/* Losers */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-foreground)" }}>輸</p>
                  <div className="space-y-1">
                    {losers.length === 0
                      ? <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>
                      : losers.map((p) => (
                          <Link key={p.id} href={`/players/${p.playerId}`}
                            className="flex items-center justify-between group/row hover:opacity-70 transition-opacity">
                            <span className="text-xs group-hover/row:underline" style={{ color: "var(--muted-foreground)" }}>{p.name}</span>
                            <span className="text-xs font-semibold tabular" style={{ color: "var(--loss)" }}>{p.amount.toLocaleString()}</span>
                          </Link>
                        ))
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => handleDelete(session.id)}
              className="shrink-0 p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--destructive)";
                (e.currentTarget as HTMLButtonElement).style.background = "color-mix(in srgb, var(--destructive) 10%, transparent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)";
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
