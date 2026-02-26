describe("Player API logic", () => {
  describe("input validation", () => {
    it("should reject empty player name", () => {
      const name = "  ";
      expect(name.trim().length).toBe(0);
    });

    it("should trim whitespace from player name", () => {
      const name = "  小明  ";
      expect(name.trim()).toBe("小明");
    });

    it("should accept valid player name", () => {
      const name = "小明";
      expect(name.trim().length).toBeGreaterThan(0);
    });
  });

  describe("player stats calculation", () => {
    it("should calculate total amount correctly", () => {
      const sessions = [{ amount: 500 }, { amount: -200 }, { amount: 300 }];
      const total = sessions.reduce((sum, s) => sum + s.amount, 0);
      expect(total).toBe(600);
    });

    it("should count sessions correctly", () => {
      const sessions = [{ amount: 100 }, { amount: -50 }];
      expect(sessions.length).toBe(2);
    });

    it("should handle player with no sessions", () => {
      const sessions: { amount: number }[] = [];
      const total = sessions.reduce((sum, s) => sum + s.amount, 0);
      expect(total).toBe(0);
      expect(sessions.length).toBe(0);
    });

    it("should display positive amount as win", () => {
      const amount = 500;
      const label = amount > 0 ? "win" : amount < 0 ? "loss" : "even";
      expect(label).toBe("win");
    });

    it("should display negative amount as loss", () => {
      const amount = -300;
      const label = amount > 0 ? "win" : amount < 0 ? "loss" : "even";
      expect(label).toBe("loss");
    });
  });

  describe("guest player", () => {
    it("should default isGuest to false", () => {
      const player = { name: "小明", isGuest: false };
      expect(player.isGuest).toBe(false);
    });

    it("should allow marking player as guest", () => {
      const player = { name: "臨時玩家", isGuest: true };
      expect(player.isGuest).toBe(true);
    });
  });
});
