"use client";

import { useRouter } from "next/navigation";

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

interface Props {
  initialSessions: Session[];
}

export default function SessionsClient({ initialSessions }: Props) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("確定要刪除這場牌局嗎？")) return;
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (initialSessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-400 mb-4">尚無牌局記錄</p>
        <a
          href="/admin/sessions/new"
          className="text-green-600 hover:underline text-sm font-medium"
        >
          新增第一場牌局
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {initialSessions.map((session) => {
        const date = new Date(session.date);
        const winners = session.players.filter((p) => p.amount > 0);
        const losers = session.players.filter((p) => p.amount < 0);

        return (
          <div
            key={session.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-gray-800">
                    {date.toLocaleDateString("zh-TW", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    {session.stakes}
                  </span>
                </div>
                <p className="text-sm text-gray-500">📍 {session.venue}</p>
                {session.note && (
                  <p className="text-sm text-gray-400 mt-1">{session.note}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(session.id)}
                className="text-gray-300 hover:text-red-400 transition-colors text-sm"
              >
                刪除
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50">
              <div>
                <p className="text-xs text-gray-400 mb-2">贏家</p>
                <div className="space-y-1">
                  {winners.length === 0 ? (
                    <p className="text-sm text-gray-300">—</p>
                  ) : (
                    winners.map((p) => (
                      <div key={p.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{p.name}</span>
                        <span className="text-green-600 font-medium">
                          +{p.amount.toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">輸家</p>
                <div className="space-y-1">
                  {losers.length === 0 ? (
                    <p className="text-sm text-gray-300">—</p>
                  ) : (
                    losers.map((p) => (
                      <div key={p.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{p.name}</span>
                        <span className="text-red-500 font-medium">
                          {p.amount.toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
