"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

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
        <p className="text-4xl mb-4">🀄</p>
        <p className="mb-6" style={{ color: "var(--muted-foreground)" }}>尚無牌局記錄</p>
        <Link href="/admin/sessions/new" className="btn-primary px-6 py-2.5 text-sm inline-block">
          記錄第一場
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {initialSessions.map((session) => {
        const date = new Date(session.date);
        const winners = session.players.filter((p) => p.amount > 0).sort((a, b) => b.amount - a.amount);
        const losers = session.players.filter((p) => p.amount < 0).sort((a, b) => a.amount - b.amount);

        return (
          <div key={session.id} className="card overflow-hidden transition-all"
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--ring)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}>
            <div className="px-6 py-4 flex items-start justify-between gap-4">
              {/* Date column */}
              <div className="shrink-0 text-center w-12 pt-0.5">
                <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--primary)" }}>
                  {date.getUTCDate()}
                </p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {date.toLocaleDateString("zh-TW", { month: "short", timeZone: "UTC" })}
                </p>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium" style={{ color: "var(--foreground)" }}>📍 {session.venue}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
                    {session.stakes}
                  </span>
                  {session.note && (
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{session.note}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <p className="text-xs mb-2 tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>贏</p>
                    <div className="space-y-1">
                      {winners.map((p) => (
                        <Link key={p.id} href={`/players/${p.playerId}`}
                          className="flex items-center justify-between text-sm group">
                          <span className="group-hover:underline" style={{ color: "var(--muted-foreground)" }}>{p.name}</span>
                          <span className="font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--win)" }}>
                            +{p.amount.toLocaleString()}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs mb-2 tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>輸</p>
                    <div className="space-y-1">
                      {losers.map((p) => (
                        <Link key={p.id} href={`/players/${p.playerId}`}
                          className="flex items-center justify-between text-sm group">
                          <span className="group-hover:underline" style={{ color: "var(--muted-foreground)" }}>{p.name}</span>
                          <span className="font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--loss)" }}>
                            {p.amount.toLocaleString()}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete */}
              <button onClick={() => handleDelete(session.id)}
                className="shrink-0 text-xs transition-colors px-2 py-1 rounded"
                style={{ color: "var(--border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--destructive)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--border)")}>
                刪除
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
