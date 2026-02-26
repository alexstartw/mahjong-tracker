import {
  buildCalendarDays,
  groupSessionsByDate,
  toDateKey,
} from "@/lib/calendar";

describe("calendar utilities", () => {
  describe("toDateKey", () => {
    it("should format date as YYYY-MM-DD", () => {
      const date = new Date(2026, 1, 5); // Feb 5 2026
      expect(toDateKey(date)).toBe("2026-02-05");
    });

    it("should pad month and day with zeros", () => {
      const date = new Date(2026, 0, 1); // Jan 1 2026
      expect(toDateKey(date)).toBe("2026-01-01");
    });
  });

  describe("buildCalendarDays", () => {
    it("should always return a multiple of 7 days", () => {
      const days = buildCalendarDays(2026, 1, new Map()); // Feb 2026
      expect(days.length % 7).toBe(0);
    });

    it("should include all days of the target month", () => {
      const days = buildCalendarDays(2026, 1, new Map()); // Feb 2026
      const currentMonthDays = days.filter((d) => d.isCurrentMonth);
      expect(currentMonthDays).toHaveLength(28); // Feb 2026 has 28 days
    });

    it("should mark days outside the month correctly", () => {
      // Jan 2026 starts on Thursday, so Sun/Mon/Tue/Wed come from Dec 2025
      const days = buildCalendarDays(2026, 0, new Map());
      const outsideDays = days.filter((d) => !d.isCurrentMonth);
      expect(outsideDays.length).toBeGreaterThan(0);
    });

    it("should start on Sunday", () => {
      const days = buildCalendarDays(2026, 1, new Map());
      expect(days[0].date.getDay()).toBe(0); // Sunday = 0
    });

    it("should end on Saturday", () => {
      const days = buildCalendarDays(2026, 1, new Map());
      expect(days[days.length - 1].date.getDay()).toBe(6); // Saturday = 6
    });

    it("should attach sessions to correct days", () => {
      const sessionMap = new Map([
        [
          "2026-02-15",
          [{ id: "1", venue: "小明家", stakes: "100/台", playerCount: 4, players: [] }],
        ],
      ]);
      const days = buildCalendarDays(2026, 1, sessionMap);
      const day15 = days.find(
        (d) => d.isCurrentMonth && d.date.getDate() === 15
      );
      expect(day15?.sessions).toHaveLength(1);
      expect(day15?.sessions[0].venue).toBe("小明家");
    });

    it("should return empty sessions for days without games", () => {
      const days = buildCalendarDays(2026, 1, new Map());
      const day1 = days.find((d) => d.isCurrentMonth && d.date.getDate() === 1);
      expect(day1?.sessions).toHaveLength(0);
    });
  });

  describe("groupSessionsByDate", () => {
    const makeSessions = () => [
      { id: "1", date: "2026-02-15T10:00:00Z", venue: "小明家", stakes: "100/台", playerCount: 4, players: [{ name: "小明", amount: 500 }, { name: "小花", amount: -500 }] },
      { id: "2", date: "2026-02-15T18:00:00Z", venue: "小花家", stakes: "50/台", playerCount: 3, players: [] },
      { id: "3", date: "2026-02-20T10:00:00Z", venue: "小強家", stakes: "200/台", playerCount: 4, players: [] },
    ];

    it("should group sessions by date key", () => {
      const map = groupSessionsByDate(makeSessions());
      expect(map.get("2026-02-15")).toHaveLength(2);
      expect(map.get("2026-02-20")).toHaveLength(1);
    });

    it("should preserve player data in sessions", () => {
      const map = groupSessionsByDate(makeSessions());
      const day15 = map.get("2026-02-15")!;
      expect(day15[0].players).toHaveLength(2);
      expect(day15[0].players[0].name).toBe("小明");
      expect(day15[0].players[0].amount).toBe(500);
    });

    it("should return empty map for no sessions", () => {
      const map = groupSessionsByDate([]);
      expect(map.size).toBe(0);
    });
  });
});
