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
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-playfair)", color: "#c9a84c" }}>
          玩家管理
        </h1>
        <span className="text-sm" style={{ color: "#4a4335" }}>共 {initialPlayers.length} 位</span>
      </div>

      {/* 新增玩家 */}
      <div className="card p-6">
        <h2 className="text-xs tracking-widest uppercase mb-4" style={{ color: "#4a4335" }}>新增玩家</h2>
        <form onSubmit={handleAdd} className="flex items-end gap-4">
          <div className="flex-1">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="輸入玩家名稱" className="input-dark" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer pb-0.5 shrink-0">
            <div className="relative">
              <input type="checkbox" checked={isGuest} onChange={(e) => setIsGuest(e.target.checked)} className="sr-only" />
              <div className="w-10 h-5 rounded-full transition-colors" style={{ background: isGuest ? "#c9a84c" : "#1a2e20", border: "1px solid #2a4530" }} />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform" style={{ background: "#f0ead8", transform: isGuest ? "translateX(20px)" : "translateX(0)" }} />
            </div>
            <span className="text-sm" style={{ color: "#a89b7e" }}>臨時</span>
          </label>
          <button type="submit" disabled={loading} className="btn-gold px-5 py-2 shrink-0">
            {loading ? "…" : "新增"}
          </button>
        </form>
        {error && <p className="text-sm mt-3" style={{ color: "#f87171" }}>{error}</p>}
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
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "#2a4530" }}>
        <h2 className="font-semibold" style={{ fontFamily: "var(--font-playfair)", color: "#c9a84c" }}>{title}</h2>
        <span className="text-xs" style={{ color: "#4a4335" }}>{players.length} 人</span>
      </div>

      {players.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm" style={{ color: "#2a4530" }}>尚無玩家</p>
      ) : (
        <div className="divide-y" style={{ borderColor: "#1a2e20" }}>
          {players.map((p) => {
            const isPositive = p.stats.totalAmount > 0;
            const isNegative = p.stats.totalAmount < 0;
            return (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4 transition-colors"
                style={{ borderColor: "#1a2e20" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1a2e2050")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <Link href={`/players/${p.id}`} className="flex-1 min-w-0 group">
                  <span className="font-medium group-hover:underline" style={{ color: "#f0ead8" }}>{p.name}</span>
                </Link>
                <span className="text-xs" style={{ color: "#4a4335" }}>{p.stats.sessionCount} 場</span>
                <span className={`text-base font-bold w-24 text-right ${isPositive ? "glow-win" : isNegative ? "glow-loss" : ""}`}
                  style={{
                    fontFamily: "var(--font-playfair)",
                    color: isPositive ? "#4ade80" : isNegative ? "#f87171" : "#4a4335",
                  }}>
                  {isPositive ? "+" : ""}{p.stats.totalAmount.toLocaleString()}
                </span>
                <button onClick={() => onDelete(p.id, p.name)}
                  className="text-xs transition-colors px-2 py-1 rounded shrink-0"
                  style={{ color: "#2a4530" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#2a4530")}>
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
