"use client";

import { useEffect, useState } from "react";

interface PlayerStats {
  sessionCount: number;
  totalAmount: number;
}

interface Player {
  id: string;
  name: string;
  isGuest: boolean;
  createdAt: string;
  stats: PlayerStats;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchPlayers() {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data);
  }

  useEffect(() => {
    fetchPlayers();
  }, []);

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
      const data = await res.json();
      setError(data.error ?? "新增失敗");
      return;
    }

    setNewName("");
    setIsGuest(false);
    fetchPlayers();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`確定要刪除玩家「${name}」嗎？`)) return;

    await fetch(`/api/players/${id}`, { method: "DELETE" });
    fetchPlayers();
  }

  const regularPlayers = players.filter((p) => !p.isGuest);
  const guestPlayers = players.filter((p) => p.isGuest);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">玩家管理</h1>
        <span className="text-sm text-gray-500">共 {players.length} 位玩家</span>
      </div>

      {/* 新增玩家 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">新增玩家</h2>
        <form onSubmit={handleAdd} className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">玩家名稱</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              placeholder="輸入名稱"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <input
              type="checkbox"
              id="isGuest"
              checked={isGuest}
              onChange={(e) => setIsGuest(e.target.checked)}
              className="w-4 h-4 accent-green-600"
            />
            <label htmlFor="isGuest" className="text-sm text-gray-600">
              臨時玩家
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
          >
            新增
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* 固定玩家 */}
      <PlayerTable
        title="固定玩家"
        players={regularPlayers}
        onDelete={handleDelete}
      />

      {/* 臨時玩家 */}
      {guestPlayers.length > 0 && (
        <PlayerTable
          title="臨時玩家"
          players={guestPlayers}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function PlayerTable({
  title,
  players,
  onDelete,
}: {
  title: string;
  players: Player[];
  onDelete: (id: string, name: string) => void;
}) {
  if (players.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">{title}</h2>
        <p className="text-gray-400 text-sm">尚無玩家</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-3 font-medium">名稱</th>
              <th className="pb-3 font-medium text-center">場次</th>
              <th className="pb-3 font-medium text-right">總輸贏</th>
              <th className="pb-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="border-b border-gray-50 last:border-0">
                <td className="py-3 font-medium text-gray-800">{player.name}</td>
                <td className="py-3 text-center text-gray-500">
                  {player.stats.sessionCount}
                </td>
                <td
                  className={`py-3 text-right font-medium ${
                    player.stats.totalAmount > 0
                      ? "text-green-600"
                      : player.stats.totalAmount < 0
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {player.stats.totalAmount > 0 ? "+" : ""}
                  {player.stats.totalAmount.toLocaleString()}
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => onDelete(player.id, player.name)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-xs"
                  >
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
