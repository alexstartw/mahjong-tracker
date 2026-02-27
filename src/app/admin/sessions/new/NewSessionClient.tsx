"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

interface Player { id: string; name: string; isGuest: boolean; }
interface Selected { playerId: string; name: string; amount: string; }

export default function NewSessionClient({ players }: { players: Player[] }) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate]       = useState(today);
  const [venue, setVenue]     = useState("");
  const [stakes, setStakes]   = useState("");
  const [note, setNote]       = useState("");
  const [selected, setSelected] = useState<Selected[]>([]);
  const [error, setError]     = useState("");
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
  const isBalanced = selected.length > 0 && total === 0;

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
      body: JSON.stringify({
        date, venue, stakes, note,
        players: selected.map((p) => ({ playerId: p.playerId, amount: parseInt(p.amount, 10) })),
      }),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "建立失敗"); return; }
    router.push("/admin/sessions");
    router.refresh();
  }

  return (
    <div className="max-w-xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="btn-ghost p-2 rounded-md" style={{ padding: "0.375rem" }}>
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
          新增牌局
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic info */}
        <div className="card p-5 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            基本資訊
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>日期</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="input-field" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>台金</label>
              <input type="text" value={stakes} onChange={(e) => setStakes(e.target.value)} required placeholder="例：100/台" className="input-field" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>地點</label>
            <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} required placeholder="例：小明家" className="input-field" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>備註（選填）</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="任何備註…" className="input-field" />
          </div>
        </div>

        {/* Player selection */}
        <div className="card p-5 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            選擇玩家
          </p>
          {players.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              請先至<a href="/admin/players" style={{ color: "var(--primary)" }} className="mx-1">玩家管理</a>新增玩家
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {players.map((p) => {
                const isSelected = selected.some((s) => s.playerId === p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlayer(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all"
                    style={{
                      background: isSelected ? "color-mix(in srgb, var(--primary) 15%, transparent)" : "var(--muted)",
                      color: isSelected ? "var(--primary)" : "var(--muted-foreground)",
                      border: `1px solid ${isSelected ? "color-mix(in srgb, var(--primary) 35%, transparent)" : "var(--border)"}`,
                      fontWeight: isSelected ? "500" : "400",
                    }}
                  >
                    {isSelected && <Check size={12} />}
                    {p.name}
                    {p.isGuest && <span className="text-[10px] opacity-60">臨時</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Amounts */}
        {selected.length > 0 && (
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                輸贏金額
              </p>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{
                  color: isBalanced ? "var(--win)" : total !== 0 ? "var(--loss)" : "var(--muted-foreground)",
                  background: isBalanced
                    ? "color-mix(in srgb, var(--win) 10%, transparent)"
                    : total !== 0
                    ? "color-mix(in srgb, var(--loss) 10%, transparent)"
                    : "var(--muted)",
                }}
              >
                {isBalanced ? "✓ 平衡" : total === 0 ? "輸入金額" : `總和 ${total > 0 ? "+" : ""}${total}`}
              </span>
            </div>
            <div className="space-y-2.5">
              {selected.map((p) => (
                <div key={p.playerId} className="flex items-center gap-3">
                  <span className="w-16 text-sm shrink-0 truncate" style={{ color: "var(--foreground)" }}>{p.name}</span>
                  <input
                    type="number"
                    value={p.amount}
                    onChange={(e) => updateAmount(p.playerId, e.target.value)}
                    placeholder="贏正輸負"
                    className="input-field flex-1 tabular"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs px-3 py-2 rounded-md" style={{ color: "var(--destructive)", background: "color-mix(in srgb, var(--destructive) 10%, transparent)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || selected.length < 2}
          className="btn-primary w-full py-2.5"
        >
          {loading ? <><Loader2 size={14} className="animate-spin" /> 儲存中…</> : "儲存牌局"}
        </button>
      </form>
    </div>
  );
}
