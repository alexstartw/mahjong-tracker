"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Player {
  id: string;
  name: string;
  isGuest: boolean;
  createdAt: string;
  stats: { sessionCount: number; totalAmount: number };
}

export default function PlayersClient({ initialPlayers }: { initialPlayers: Player[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, isGuest }),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "新增失敗"); return; }
    setNewName("");
    setIsGuest(false);
    router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`確定要刪除「${name}」嗎？`)) return;
    await fetch(`/api/players/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const regular = initialPlayers.filter((p) => !p.isGuest);
  const guests = initialPlayers.filter((p) => p.isGuest);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--primary)" }}>
          玩家管理
        </h1>
        <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>共 {initialPlayers.length} 位</span>
      </div>

      {/* 新增玩家 */}
      <div className="card p-6">
        <h2 className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--muted-foreground)" }}>新增玩家</h2>
        <form onSubmit={handleAdd} className="flex items-end gap-4">
          <div className="flex-1">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="輸入玩家名稱" className="input-field" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer pb-0.5 shrink-0">
            <div className="relative">
              <input type="checkbox" checked={isGuest} onChange={(e) => setIsGuest(e.target.checked)} className="sr-only" />
              <div className="w-10 h-5 rounded-full transition-colors" style={{ background: isGuest ? "var(--primary)" : "var(--muted)", border: "1px solid var(--border)" }} />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform" style={{ background: "var(--primary-foreground)", transform: isGuest ? "translateX(20px)" : "translateX(0)" }} />
            </div>
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>臨時</span>
          </label>
          <button type="submit" disabled={loading} className="btn-primary px-5 py-2 shrink-0">
            {loading ? "…" : "新增"}
          </button>
        </form>
        {error && <p className="text-sm mt-3" style={{ color: "var(--destructive)" }}>{error}</p>}
      </div>

      {/* 固定玩家 */}
      <PlayerTable title="固定玩家" players={regular} onDelete={handleDelete} />

      {/* 臨時玩家 */}
      {guests.length > 0 && (
        <PlayerTable title="臨時玩家" players={guests} onDelete={handleDelete} />
      )}
    </div>
  );
}

function PlayerTable({ title, players, onDelete }: {
  title: string;
  players: Player[];
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-semibold" style={{ fontFamily: "var(--font-serif)", color: "var(--primary)" }}>{title}</h2>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{players.length} 人</span>
      </div>

      {players.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>尚無玩家</p>
      ) : (
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {players.map((p) => {
            const isPositive = p.stats.totalAmount > 0;
            const isNegative = p.stats.totalAmount < 0;
            return (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4 transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <Link href={`/players/${p.id}`} className="flex-1 min-w-0 group">
                  <span className="font-medium group-hover:underline" style={{ color: "var(--foreground)" }}>{p.name}</span>
                </Link>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{p.stats.sessionCount} 場</span>
                <span className="text-base font-bold w-24 text-right"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: isPositive ? "var(--win)" : isNegative ? "var(--loss)" : "var(--muted-foreground)",
                  }}>
                  {isPositive ? "+" : ""}{p.stats.totalAmount.toLocaleString()}
                </span>
                <button onClick={() => onDelete(p.id, p.name)}
                  className="text-xs transition-colors px-2 py-1 rounded shrink-0"
                  style={{ color: "var(--border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--destructive)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--border)")}>
                  刪除
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
