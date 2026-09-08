import { describe, it, expect, beforeEach, vi } from "vitest";
import { useKillSwitchStore } from "../killSwitchStore";

vi.mock("zustand/middleware", () => ({
  persist: vi.fn((config) => config),
}));

describe("useKillSwitchStore", () => {
  beforeEach(() => {
    const { setKillSwitchStatus } = useKillSwitchStore.getState();
    setKillSwitchStatus(false);
  });

  describe("Initial State", () => {
    it("should initialize with killSwitchStatus as false", () => {
      const { killSwitchStatus } = useKillSwitchStore.getState();
      expect(killSwitchStatus).toBe(false);
    });
  });

  describe("setKillSwitchStatus", () => {
    it("should set killSwitchStatus to true", () => {
      const { setKillSwitchStatus, killSwitchStatus: initialStatus } = useKillSwitchStore.getState();
      
      expect(initialStatus).toBe(false);
      
      setKillSwitchStatus(true);
      
      const { killSwitchStatus } = useKillSwitchStore.getState();
      expect(killSwitchStatus).toBe(true);
    });

    it("should set killSwitchStatus to false", () => {
      const { setKillSwitchStatus } = useKillSwitchStore.getState();
      
      setKillSwitchStatus(true);
      expect(useKillSwitchStore.getState().killSwitchStatus).toBe(true);
      
      setKillSwitchStatus(false);
      expect(useKillSwitchStore.getState().killSwitchStatus).toBe(false);
    });

    it("should toggle killSwitchStatus multiple times", () => {
      const { setKillSwitchStatus } = useKillSwitchStore.getState();
      
      setKillSwitchStatus(true);
      expect(useKillSwitchStore.getState().killSwitchStatus).toBe(true);
      
      setKillSwitchStatus(false);
      expect(useKillSwitchStore.getState().killSwitchStatus).toBe(false);
      
      setKillSwitchStatus(true);
      expect(useKillSwitchStore.getState().killSwitchStatus).toBe(true);
      
      setKillSwitchStatus(false);
      expect(useKillSwitchStore.getState().killSwitchStatus).toBe(false);
    });

    it("should maintain state when setting same value", () => {
      const { setKillSwitchStatus } = useKillSwitchStore.getState();
      
      setKillSwitchStatus(true);
      expect(useKillSwitchStore.getState().killSwitchStatus).toBe(true);
      
      setKillSwitchStatus(true);
      expect(useKillSwitchStore.getState().killSwitchStatus).toBe(true);
    });

    it("should handle rapid state changes", () => {
      const { setKillSwitchStatus } = useKillSwitchStore.getState();
      
      for (let i = 0; i < 10; i++) {
        setKillSwitchStatus(i % 2 === 0);
      }
      
      expect(useKillSwitchStore.getState().killSwitchStatus).toBe(false);
    });
  });

  describe("State Independence", () => {
    it("should maintain independent state across multiple reads", () => {
      const { setKillSwitchStatus } = useKillSwitchStore.getState();
      
      const state1 = useKillSwitchStore.getState();
      expect(state1.killSwitchStatus).toBe(false);
      
      setKillSwitchStatus(true);
      
      const state2 = useKillSwitchStore.getState();
      expect(state2.killSwitchStatus).toBe(true);
      expect(state1.killSwitchStatus).toBe(false);
    });
  });

  describe("Boolean Type Safety", () => {
    it("should accept true boolean value", () => {
      const { setKillSwitchStatus } = useKillSwitchStore.getState();
      
      setKillSwitchStatus(true);
      expect(useKillSwitchStore.getState().killSwitchStatus).toBe(true);
    });

    it("should accept false boolean value", () => {
      const { setKillSwitchStatus } = useKillSwitchStore.getState();
      
      setKillSwitchStatus(false);
      expect(useKillSwitchStore.getState().killSwitchStatus).toBe(false);
    });

    it("should accept boolean from expression", () => {
      const { setKillSwitchStatus } = useKillSwitchStore.getState();
      
      const shouldEnable = 1 > 0;
      setKillSwitchStatus(shouldEnable);
      expect(useKillSwitchStore.getState().killSwitchStatus).toBe(true);
    });
  });
});
