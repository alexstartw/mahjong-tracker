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
        <p className="mb-6" style={{ color: "#4a4335" }}>尚無牌局記錄</p>
        <Link href="/admin/sessions/new" className="btn-gold px-6 py-2.5 text-sm inline-block">
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
          <div key={session.id} className="card overflow-hidden transition-all" style={{ borderColor: "#2a4530" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3d6347")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a4530")}>
            <div className="px-6 py-4 flex items-start justify-between gap-4">
              {/* Date column */}
              <div className="shrink-0 text-center w-12 pt-0.5">
                <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair)", color: "#c9a84c" }}>
                  {date.getUTCDate()}
                </p>
                <p className="text-xs" style={{ color: "#4a4335" }}>
                  {date.toLocaleDateString("zh-TW", { month: "short", timeZone: "UTC" })}
                </p>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium" style={{ color: "#f0ead8" }}>📍 {session.venue}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#1a2e20", color: "#a89b7e", border: "1px solid #2a4530" }}>
                    {session.stakes}
                  </span>
                  {session.note && (
                    <span className="text-xs" style={{ color: "#4a4335" }}>{session.note}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t" style={{ borderColor: "#1a2e20" }}>
                  <div>
                    <p className="text-xs mb-2 tracking-widest uppercase" style={{ color: "#4a4335" }}>贏</p>
                    <div className="space-y-1">
                      {winners.map((p) => (
                        <Link key={p.id} href={`/players/${p.playerId}`}
                          className="flex items-center justify-between text-sm group">
                          <span className="group-hover:underline" style={{ color: "#a89b7e" }}>{p.name}</span>
                          <span className="font-bold glow-win" style={{ fontFamily: "var(--font-playfair)", color: "#4ade80" }}>
                            +{p.amount.toLocaleString()}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs mb-2 tracking-widest uppercase" style={{ color: "#4a4335" }}>輸</p>
                    <div className="space-y-1">
                      {losers.map((p) => (
                        <Link key={p.id} href={`/players/${p.playerId}`}
                          className="flex items-center justify-between text-sm group">
                          <span className="group-hover:underline" style={{ color: "#a89b7e" }}>{p.name}</span>
                          <span className="font-bold glow-loss" style={{ fontFamily: "var(--font-playfair)", color: "#f87171" }}>
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
                style={{ color: "#2a4530" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#2a4530")}>
                刪除
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
