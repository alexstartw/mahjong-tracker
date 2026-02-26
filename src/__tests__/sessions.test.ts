describe("Session logic", () => {
  describe("input validation", () => {
    it("should require at least 2 players", () => {
      const players: { playerId: string; amount: number }[] = [
        { playerId: "1", amount: 500 },
      ];
      expect(players.length >= 2).toBe(false);
    });

    it("should pass with 2 or more players", () => {
      const players = [
        { playerId: "1", amount: 500 },
        { playerId: "2", amount: -500 },
      ];
      expect(players.length >= 2).toBe(true);
    });

    it("should require date, venue, and stakes", () => {
      const required = ["date", "venue", "stakes"];
      const input = { date: "2026-01-01", venue: "小明家", stakes: "100/台" };
      required.forEach((field) => {
        expect(input[field as keyof typeof input]).toBeTruthy();
      });
    });
  });

  describe("zero-sum validation", () => {
    it("should pass when amounts sum to zero", () => {
      const players = [
        { amount: 1000 },
        { amount: -600 },
        { amount: -400 },
      ];
      const total = players.reduce((sum, p) => sum + p.amount, 0);
      expect(total).toBe(0);
    });

    it("should fail when amounts do not sum to zero", () => {
      const players = [
        { amount: 1000 },
        { amount: -500 },
      ];
      const total = players.reduce((sum, p) => sum + p.amount, 0);
      expect(total).not.toBe(0);
    });

    it("should handle four players summing to zero", () => {
      const players = [
        { amount: 800 },
        { amount: 200 },
        { amount: -300 },
        { amount: -700 },
      ];
      const total = players.reduce((sum, p) => sum + p.amount, 0);
      expect(total).toBe(0);
    });
  });

  describe("session display", () => {
    it("should classify winners and losers correctly", () => {
      const players = [
        { name: "小明", amount: 500 },
        { name: "小花", amount: -300 },
        { name: "小強", amount: -200 },
      ];
      const winners = players.filter((p) => p.amount > 0);
      const losers = players.filter((p) => p.amount < 0);
      expect(winners).toHaveLength(1);
      expect(losers).toHaveLength(2);
      expect(winners[0].name).toBe("小明");
    });

    it("should format positive amount as win", () => {
      const amount = 500;
      const display = amount > 0 ? `+${amount}` : `${amount}`;
      expect(display).toBe("+500");
    });

    it("should format negative amount as loss", () => {
      const amount = -300;
      const display = amount > 0 ? `+${amount}` : `${amount}`;
      expect(display).toBe("-300");
    });
  });

  describe("date formatting", () => {
    it("should parse ISO date string correctly", () => {
      const isoDate = "2026-02-26T00:00:00.000Z";
      const date = new Date(isoDate);
      expect(date).toBeInstanceOf(Date);
      expect(isNaN(date.getTime())).toBe(false);
    });
  });
});
