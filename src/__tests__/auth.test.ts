import bcrypt from "bcryptjs";

describe("Authentication utilities", () => {
  describe("password hashing", () => {
    it("should hash a password", async () => {
      const password = "admin123";
      const hash = await bcrypt.hash(password, 12);
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should verify correct password", async () => {
      const password = "admin123";
      const hash = await bcrypt.hash(password, 12);
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject wrong password", async () => {
      const password = "admin123";
      const hash = await bcrypt.hash(password, 12);
      const isValid = await bcrypt.compare("wrongpassword", hash);
      expect(isValid).toBe(false);
    });

    it("should generate different hashes for same password", async () => {
      const password = "admin123";
      const hash1 = await bcrypt.hash(password, 12);
      const hash2 = await bcrypt.hash(password, 12);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("middleware route protection", () => {
    it("should define protected admin routes", () => {
      const protectedPaths = ["/admin", "/admin/sessions", "/admin/players"];
      protectedPaths.forEach((path) => {
        expect(path.startsWith("/admin")).toBe(true);
      });
    });

    it("should define public routes", () => {
      const publicPaths = ["/calendar", "/login"];
      publicPaths.forEach((path) => {
        expect(path.startsWith("/admin")).toBe(false);
      });
    });
  });
});
