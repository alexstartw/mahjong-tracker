"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Plus, Pencil, X, Loader2 } from "lucide-react";

interface Player {
  id: string;
  name: string;
  isGuest: boolean;
  createdAt: string;
  stats: { sessionCount: number; totalAmount: number };
}

function EditPlayerModal({
  player,
  onClose,
}: {
  player: Player;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(player.name);
  const [isGuest, setIsGuest] = useState(player.isGuest);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`/api/players/${player.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, isGuest }),
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
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-xl overflow-hidden"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            編輯玩家
          </p>
          <button
            onClick={onClose}
            className="p-1 rounded"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label
              className="text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              名稱
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-field w-full"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              role="switch"
              aria-checked={isGuest}
              onClick={() => setIsGuest((v) => !v)}
              className="relative w-9 h-5 rounded-full transition-colors shrink-0"
              style={{
                background: isGuest ? "var(--primary)" : "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                style={{
                  background: "var(--foreground)",
                  left: isGuest ? "calc(100% - 18px)" : "2px",
                }}
              />
            </button>
            <span
              className="text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              臨時玩家
            </span>
          </label>

          {error && (
            <p
              className="text-xs px-3 py-1.5 rounded"
              style={{
                color: "var(--destructive)",
                background:
                  "color-mix(in srgb, var(--destructive) 10%, transparent)",
              }}
            >
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 py-2 text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> 儲存中…
                </>
              ) : (
                "儲存"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PlayersClient({
  initialPlayers,
  isLoggedIn,
}: {
  initialPlayers: Player[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

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
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "新增失敗");
      return;
    }
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
    <>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            玩家管理
          </h1>
          <span
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            {initialPlayers.length} 位
          </span>
        </div>

        {/* Add form */}
        {isLoggedIn && (
          <div className="card p-5">
            <p
              className="text-xs font-medium uppercase tracking-wider mb-4"
              style={{ color: "var(--muted-foreground)" }}
            >
              新增玩家
            </p>
            <form onSubmit={handleAdd} className="flex items-center gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                placeholder="玩家名稱"
                className="input-field flex-1"
              />

              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isGuest}
                  onClick={() => setIsGuest((v) => !v)}
                  className="relative w-9 h-5 rounded-full transition-colors"
                  style={{
                    background: isGuest ? "var(--primary)" : "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                    style={{
                      background: "var(--foreground)",
                      left: isGuest ? "calc(100% - 18px)" : "2px",
                    }}
                  />
                </button>
                <span
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  臨時
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary shrink-0"
              >
                <Plus size={14} /> {loading ? "…" : "新增"}
              </button>
            </form>
            {error && (
              <p
                className="text-xs mt-3 px-3 py-1.5 rounded"
                style={{
                  color: "var(--destructive)",
                  background:
                    "color-mix(in srgb, var(--destructive) 10%, transparent)",
                }}
              >
                {error}
              </p>
            )}
          </div>
        )}

        {/* Regular players */}
        <PlayerTable
          title="固定玩家"
          players={regular}
          onDelete={handleDelete}
          onEdit={setEditingPlayer}
          isLoggedIn={isLoggedIn}
        />

        {/* Guest players */}
        {guests.length > 0 && (
          <PlayerTable
            title="臨時玩家"
            players={guests}
            onDelete={handleDelete}
            onEdit={setEditingPlayer}
            isLoggedIn={isLoggedIn}
          />
        )}
      </div>

      {editingPlayer && (
        <EditPlayerModal
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
        />
      )}
    </>
  );
}

function PlayerTable({
  title,
  players,
  onDelete,
  onEdit,
  isLoggedIn,
}: {
  title: string;
  players: Player[];
  onDelete: (id: string, name: string) => void;
  onEdit: (player: Player) => void;
  isLoggedIn: boolean;
}) {
  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <p
          className="text-sm font-medium"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </p>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {players.length} 人
        </span>
      </div>

      {players.length === 0 ? (
        <p
          className="px-5 py-8 text-sm text-center"
          style={{ color: "var(--muted-foreground)" }}
        >
          尚無玩家
        </p>
      ) : (
        <div>
          {players.map((p, i) => {
            const isPos = p.stats.totalAmount > 0;
            const isNeg = p.stats.totalAmount < 0;
            return (
              <div
                key={p.id}
                className="flex items-center gap-4 px-5 py-3 group transition-colors"
                style={{
                  borderBottom:
                    i < players.length - 1 ? "1px solid var(--border)" : "none",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--muted)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Link
                  href={`/players/${p.id}`}
                  className="flex-1 min-w-0 hover:opacity-70 transition-opacity"
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    {p.name}
                  </span>
                </Link>

                <span
                  className="text-xs shrink-0 tabular"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {p.stats.sessionCount} 場
                </span>

                <span
                  className="text-sm font-semibold w-20 text-right shrink-0 tabular"
                  style={{
                    color: isPos
                      ? "var(--win)"
                      : isNeg
                        ? "var(--loss)"
                        : "var(--muted-foreground)",
                  }}
                >
                  {isPos ? "+" : ""}
                  {p.stats.totalAmount.toLocaleString()}
                </span>

                {isLoggedIn && (
                  <div className="shrink-0 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(p)}
                      className="p-1.5 rounded transition-colors"
                      style={{ color: "var(--muted-foreground)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "var(--primary)";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background =
                          "color-mix(in srgb, var(--primary) 10%, transparent)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "var(--muted-foreground)";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "transparent";
                      }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(p.id, p.name)}
                      className="shrink-0 p-1.5 rounded transition-colors"
                      style={{ color: "var(--muted-foreground)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "var(--destructive)";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background =
                          "color-mix(in srgb, var(--destructive) 10%, transparent)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "var(--muted-foreground)";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "transparent";
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
