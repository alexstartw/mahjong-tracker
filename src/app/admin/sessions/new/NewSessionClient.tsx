"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Player { id: string; name: string; isGuest: boolean; }
interface Selected { playerId: string; name: string; amount: string; }

export default function NewSessionClient({ players }: { players: Player[] }) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [venue, setVenue] = useState("");
  const [stakes, setStakes] = useState("");
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<Selected[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function togglePlayer(p: Player) {
    setSelected((prev) =>
      prev.find((s) => s.playerId === p.id)
        ? prev.filter((s) => s.playerId !== p.id)
        : [...prev, { playerId: p.id, name: p.name, amount: "" }]
    );
  }

  function updateAmount(playerId: string, value: string) {
    setSelected((prev) => prev.map((p) => p.playerId === playerId ? { ...p, amount: value } : p));
  }

  const total = selected.reduce((sum, p) => {
    const n = parseInt(p.amount || "0", 10);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
  const isBalanced = total === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (selected.length < 2) { setError("至少需要選擇 2 位玩家"); return; }
    for (const p of selected) {
      if (!p.amount || isNaN(parseInt(p.amount, 10))) { setError(`請輸入 ${p.name} 的金額`); return; }
    }
    if (!isBalanced) { setError(`金額總和須為 0（目前 ${total > 0 ? "+" : ""}${total}）`); return; }
    setLoading(true);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, venue, stakes, note, players: selected.map((p) => ({ playerId: p.playerId, amount: parseInt(p.amount, 10) })) }),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "建立失敗"); return; }
    router.push("/admin/sessions");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="btn-ghost w-9 h-9 flex items-center justify-center p-0 rounded-full">
          ←
        </button>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--primary)" }}>
          新增牌局
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 基本資訊 */}
        <div className="card p-6 space-y-4">
          <h2 className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--muted-foreground)" }}>基本資訊</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>日期</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="input-field" />
            </div>
            <div>
              <label className="block text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>台金</label>
              <input type="text" value={stakes} onChange={(e) => setStakes(e.target.value)} required placeholder="例：100/台" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>地點</label>
            <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} required placeholder="例：小明家" className="input-field" />
          </div>
          <div>
            <label className="block text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>備註（選填）</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="任何備註…" className="input-field" />
          </div>
        </div>

        {/* 選擇玩家 */}
        <div className="card p-6">
          <h2 className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--muted-foreground)" }}>選擇玩家</h2>
          {players.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              請先至<a href="/admin/players" className="mx-1" style={{ color: "var(--primary)" }}>玩家管理</a>新增玩家
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {players.map((p) => {
                const isSelected = selected.some((s) => s.playerId === p.id);
                return (
                  <button key={p.id} type="button" onClick={() => togglePlayer(p)}
                    className="px-4 py-2 rounded-full text-sm transition-all"
                    style={{
                      background: isSelected ? "var(--primary)" : "var(--muted)",
                      color: isSelected ? "var(--primary-foreground)" : "var(--muted-foreground)",
                      border: `1px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                      fontWeight: isSelected ? "700" : "400",
                    }}>
                    {p.name}
                    {p.isGuest && <span className="ml-1 text-xs opacity-60">臨時</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 輸入金額 */}
        {selected.length > 0 && (
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>輸贏金額</h2>
              <span className="text-sm font-bold" style={{ fontFamily: "var(--font-serif)", color: isBalanced ? "var(--win)" : "var(--loss)" }}>
                {isBalanced ? "✓ 平衡" : `總和 ${total > 0 ? "+" : ""}${total}`}
              </span>
            </div>
            <div className="space-y-3">
              {selected.map((p) => (
                <div key={p.playerId} className="flex items-center gap-4">
                  <span className="w-20 text-sm shrink-0" style={{ color: "var(--foreground)" }}>{p.name}</span>
                  <input
                    type="number"
                    value={p.amount}
                    onChange={(e) => updateAmount(p.playerId, e.target.value)}
                    placeholder="贏正輸負"
                    className="input-field flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-center" style={{ color: "var(--destructive)" }}>{error}</p>}

        <button type="submit" disabled={loading || selected.length < 2} className="btn-primary w-full py-3">
          {loading ? "儲存中…" : "儲存牌局"}
        </button>
      </form>
    </div>
  );
}
