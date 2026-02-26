"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Player {
  id: string;
  name: string;
  isGuest: boolean;
}

interface SelectedPlayer {
  playerId: string;
  name: string;
  amount: string;
}

interface Props {
  players: Player[];
}

export default function NewSessionClient({ players }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [venue, setVenue] = useState("");
  const [stakes, setStakes] = useState("");
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<SelectedPlayer[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function togglePlayer(player: Player) {
    setSelected((prev) => {
      const exists = prev.find((p) => p.playerId === player.id);
      if (exists) {
        return prev.filter((p) => p.playerId !== player.id);
      }
      return [...prev, { playerId: player.id, name: player.name, amount: "" }];
    });
  }

  function updateAmount(playerId: string, value: string) {
    setSelected((prev) =>
      prev.map((p) => (p.playerId === playerId ? { ...p, amount: value } : p))
    );
  }

  const total = selected.reduce((sum, p) => {
    const n = parseInt(p.amount || "0", 10);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const isBalanced = total === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (selected.length < 2) {
      setError("至少需要選擇 2 位玩家");
      return;
    }

    for (const p of selected) {
      if (p.amount === "" || isNaN(parseInt(p.amount, 10))) {
        setError(`請輸入 ${p.name} 的輸贏金額`);
        return;
      }
    }

    if (!isBalanced) {
      setError(`金額總和必須為 0（目前為 ${total > 0 ? "+" : ""}${total}）`);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        venue,
        stakes,
        note,
        players: selected.map((p) => ({
          playerId: p.playerId,
          amount: parseInt(p.amount, 10),
        })),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "建立失敗");
      return;
    }

    router.push("/admin/sessions");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← 返回
        </button>
        <h1 className="text-2xl font-bold text-gray-800">新增牌局</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本資訊 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-700">基本資訊</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">台金</label>
              <input
                type="text"
                value={stakes}
                onChange={(e) => setStakes(e.target.value)}
                required
                placeholder="例：100/台"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">地點</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
              placeholder="例：小明家"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              備註（選填）
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="任何備註..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* 選擇玩家 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-700">選擇玩家</h2>

          {players.length === 0 ? (
            <p className="text-sm text-gray-400">
              尚無玩家，請先至
              <a href="/admin/players" className="text-green-600 hover:underline mx-1">
                玩家管理
              </a>
              新增
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {players.map((player) => {
                const isSelected = selected.some(
                  (p) => p.playerId === player.id
                );
                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => togglePlayer(player)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      isSelected
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-green-400"
                    }`}
                  >
                    {player.name}
                    {player.isGuest && (
                      <span className="ml-1 text-xs opacity-70">臨時</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 輸入金額 */}
        {selected.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-700">
                輸贏金額
              </h2>
              <span
                className={`text-sm font-medium ${
                  isBalanced
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                總和：{total > 0 ? "+" : ""}
                {total}
                {isBalanced ? " ✓" : " （需為 0）"}
              </span>
            </div>

            <div className="space-y-3">
              {selected.map((p) => (
                <div key={p.playerId} className="flex items-center gap-4">
                  <span className="w-24 text-sm font-medium text-gray-700 shrink-0">
                    {p.name}
                  </span>
                  <input
                    type="number"
                    value={p.amount}
                    onChange={(e) => updateAmount(p.playerId, e.target.value)}
                    placeholder="輸贏金額（贏為正、輸為負）"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || selected.length < 2}
          className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
        >
          {loading ? "儲存中..." : "儲存牌局"}
        </button>
      </form>
    </div>
  );
}
