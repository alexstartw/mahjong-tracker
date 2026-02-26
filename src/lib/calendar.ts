export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  sessions: SessionSummary[];
}

export interface SessionSummary {
  id: string;
  venue: string;
  stakes: string;
  playerCount: number;
}

export function buildCalendarDays(
  year: number,
  month: number,
  sessionsByDate: Map<string, SessionSummary[]>
): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from Sunday (0) of the week containing the 1st
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  // End on Saturday of the week containing the last day
  const endDate = new Date(lastDay);
  endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const days: CalendarDay[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const key = toDateKey(cursor);
    days.push({
      date: new Date(cursor),
      isCurrentMonth: cursor.getMonth() === month,
      sessions: sessionsByDate.get(key) ?? [],
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function groupSessionsByDate(
  sessions: { id: string; date: string; venue: string; stakes: string; playerCount: number }[]
): Map<string, SessionSummary[]> {
  const map = new Map<string, SessionSummary[]>();
  for (const s of sessions) {
    const key = s.date.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({
      id: s.id,
      venue: s.venue,
      stakes: s.stakes,
      playerCount: s.playerCount,
    });
  }
  return map;
}
