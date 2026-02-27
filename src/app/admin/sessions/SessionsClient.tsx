"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Pencil, X, Plus, Loader2 } from "lucide-react";

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
  base: number | null;
  unit: number | null;
  note: string | null;
  players: SessionPlayer[];
}

interface AllPlayer {
  id: string;
  name: string;
  isGuest: boolean;
}

function StakesBadge({ base, unit }: { base: number | null; unit: number | null }) {
  if (base == null && unit == null) return null;
  const parts: string[] = [];
  if (base != null) parts.push(`底 ${base}`);
  if (unit != null) parts.push(`台 ${unit}`);
  return (
    <span
      className="text-xs px-1.5 py-0.5 rounded"
      style={{ background: "var(--accent)", color: "var(--muted-foreground)" }}
    >
      {parts.join(" / ")}
    </span>
  );
}

interface EditRow {
  playerId: string;
  name: string;
  amount: string;
}

function EditSessionModal({
  session,
  allPlayers,
  onClose,
}: {
  session: Session;
  allPlayers: AllPlayer[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [venue, setVenue] = useState(session.venue);
  const [date, setDate] = useState(session.date.slice(0, 10));
  const [base, setBase] = useState(session.base != null ? String(session.base) : "");
  const [unit, setUnit] = useState(session.unit != null ? String(session.unit) : "");
  const [note, setNote] = useState(session.note ?? "");
  const [rows, setRows] = useState<EditRow[]>(
    session.players.map((p) => ({
      playerId: p.playerId,
      name: p.name,
      amount: String(p.amount),
    }))
  );
  const [addPlayerId, setAddPlayerId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const total = rows.reduce((s, r) => {
    const n = parseInt(r.amount || "0", 10);
    return s + (isNaN(n) ? 0 : n);
  }, 0);
  const isBalanced = rows.length >= 2 && total === 0;

  const availablePlayers = allPlayers.filter(
    (p) => !rows.some((r) => r.playerId === p.id)
  );

  function updateAmount(playerId: string, val: string) {
    setRows((prev) =>
      prev.map((r) => (r.playerId === playerId ? { ...r, amount: val } : r))
    );
  }

  function removeRow(playerId: string) {
    setRows((prev) => prev.filter((r) => r.playerId !== playerId));
  }

  function addPlayer() {
    const p = allPlayers.find((p) => p.id === addPlayerId);
    if (!p) return;
    setRows((prev) => [...prev, { playerId: p.id, name: p.name, amount: "" }]);
    setAddPlayerId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (rows.length < 2) { setError("至少需要 2 位玩家"); return; }
    for (const r of rows) {
      if (!r.amount || isNaN(parseInt(r.amount, 10))) {
        setError(`請輸入 ${r.name} 的金額`);
        return;
      }
    }
    if (!isBalanced) {
      setError(`金額總和須為 0（目前 ${total > 0 ? "+" : ""}${total}）`);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venue,
        date,
        base: base !== "" ? parseInt(base, 10) : null,
        unit: unit !== "" ? parseInt(unit, 10) : null,
        note: note || null,
        players: rows.map((r) => ({
          playerId: r.playerId,
          amount: parseInt(r.amount, 10),
        })),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "儲存失敗");
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-xl overflow-hidden"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            編輯牌局
          </p>
          <button
            onClick={onClose}
            className="p-1 rounded"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Date + Venue */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>地點</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          {/* Base + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>底（選填）</label>
              <input
                type="number"
                value={base}
                onChange={(e) => setBase(e.target.value)}
                placeholder="底金額"
                className="input-field"
                min={0}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>台（選填）</label>
              <input
                type="number"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="台金額"
                className="input-field"
                min={0}
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>備註（選填）</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="任何備註…"
              className="input-field"
            />
          </div>

          {/* Players */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                玩家金額
              </label>
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

            <div className="space-y-2">
              {rows.map((r) => (
                <div key={r.playerId} className="flex items-center gap-2">
                  <span className="w-16 text-sm shrink-0 truncate" style={{ color: "var(--foreground)" }}>
                    {r.name}
                  </span>
                  <input
                    type="number"
                    value={r.amount}
                    onChange={(e) => updateAmount(r.playerId, e.target.value)}
                    placeholder="贏正輸負"
                    className="input-field flex-1 tabular"
                  />
                  {rows.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeRow(r.playerId)}
                      className="shrink-0 p-1 rounded"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add player */}
            {availablePlayers.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <select
                  value={addPlayerId}
                  onChange={(e) => setAddPlayerId(e.target.value)}
                  className="input-field flex-1 text-sm"
                >
                  <option value="">新增玩家…</option>
                  {availablePlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.isGuest ? " (臨時)" : ""}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addPlayer}
                  disabled={!addPlayerId}
                  className="btn-primary shrink-0"
                  style={{ padding: "0.375rem 0.75rem" }}
                >
                  <Plus size={13} />
                </button>
              </div>
            )}
          </div>

          {error && (
            <p
              className="text-xs px-3 py-2 rounded"
              style={{ color: "var(--destructive)", background: "color-mix(in srgb, var(--destructive) 10%, transparent)" }}
            >
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2 text-sm">
              取消
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-2 text-sm">
              {loading ? <><Loader2 size={13} className="animate-spin" /> 儲存中…</> : "儲存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SessionsClient({
  initialSessions,
  allPlayers,
  isLoggedIn,
}: {
  initialSessions: Session[];
  allPlayers: AllPlayer[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("確定要刪除這場牌局記錄？")) return;
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (initialSessions.length === 0) {
    return (
      <div className="card p-16 text-center">
        <p className="text-4xl mb-3">🀄</p>
        <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>
          尚無牌局記錄
        </p>
        {isLoggedIn && (
          <Link href="/admin/sessions/new" className="btn-primary text-sm">
            記錄第一場
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="card overflow-hidden">
        {initialSessions.map((session, i) => {
          const date = new Date(session.date);
          const winners = session.players
            .filter((p) => p.amount > 0)
            .sort((a, b) => b.amount - a.amount);
          const losers = session.players
            .filter((p) => p.amount < 0)
            .sort((a, b) => a.amount - b.amount);
          const isLast = i === initialSessions.length - 1;

          return (
            <div
              key={session.id}
              className="flex items-start gap-5 px-5 py-4 group transition-colors"
              style={{ borderBottom: isLast ? "none" : "1px solid var(--border)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--muted)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {/* Date */}
              <div className="shrink-0 w-10 text-center pt-0.5">
                <p
                  className="text-xl font-semibold tabular leading-none"
                  style={{ color: "var(--foreground)" }}
                >
                  {date.getUTCDate()}
                </p>
                <p
                  className="text-[11px] mt-0.5"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {date.toLocaleDateString("zh-TW", { month: "short", timeZone: "UTC" })}
                </p>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {session.venue}
                  </span>
                  <StakesBadge base={session.base} unit={session.unit} />
                  {session.note && (
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {session.note}
                    </span>
                  )}
                </div>

                <div
                  className="grid grid-cols-2 gap-3 pt-2.5"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  {/* Winners */}
                  <div>
                    <p
                      className="text-[11px] uppercase tracking-wider mb-1.5"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      贏
                    </p>
                    <div className="space-y-1">
                      {winners.length === 0 ? (
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>
                      ) : (
                        winners.map((p) => (
                          <Link
                            key={p.id}
                            href={`/players/${p.playerId}`}
                            className="flex items-center justify-between group/row hover:opacity-70 transition-opacity"
                          >
                            <span className="text-xs group-hover/row:underline" style={{ color: "var(--muted-foreground)" }}>
                              {p.name}
                            </span>
                            <span className="text-xs font-semibold tabular" style={{ color: "var(--win)" }}>
                              +{p.amount.toLocaleString()}
                            </span>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                  {/* Losers */}
                  <div>
                    <p
                      className="text-[11px] uppercase tracking-wider mb-1.5"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      輸
                    </p>
                    <div className="space-y-1">
                      {losers.length === 0 ? (
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>
                      ) : (
                        losers.map((p) => (
                          <Link
                            key={p.id}
                            href={`/players/${p.playerId}`}
                            className="flex items-center justify-between group/row hover:opacity-70 transition-opacity"
                          >
                            <span className="text-xs group-hover/row:underline" style={{ color: "var(--muted-foreground)" }}>
                              {p.name}
                            </span>
                            <span className="text-xs font-semibold tabular" style={{ color: "var(--loss)" }}>
                              {p.amount.toLocaleString()}
                            </span>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {isLoggedIn && (
                <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingSession(session)}
                    className="p-1.5 rounded transition-colors"
                    style={{ color: "var(--muted-foreground)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--primary)";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "color-mix(in srgb, var(--primary) 10%, transparent)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)";
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="p-1.5 rounded transition-colors"
                    style={{ color: "var(--muted-foreground)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--destructive)";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "color-mix(in srgb, var(--destructive) 10%, transparent)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)";
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingSession && (
        <EditSessionModal
          session={editingSession}
          allPlayers={allPlayers}
          onClose={() => setEditingSession(null)}
        />
      )}
    </>
  );
}
