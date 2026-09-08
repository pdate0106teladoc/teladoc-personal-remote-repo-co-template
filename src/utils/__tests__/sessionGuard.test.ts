import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  verifySessionTokens,
  requireSessionTokens,
  VerifySessionOptions,
} from "../sessionGuard";

describe("sessionGuard", () => {
  let originalSessionStorage: Storage;

  beforeEach(() => {
    vi.useFakeTimers();
    // Save original sessionStorage
    originalSessionStorage = global.sessionStorage;
    // Mock sessionStorage
    const sessionStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
        get length() {
          return Object.keys(store).length;
        },
        key: (index: number) => Object.keys(store)[index] || null,
      };
    })();
    Object.defineProperty(global, "sessionStorage", {
      value: sessionStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    global.sessionStorage.clear();
    // Restore original sessionStorage
    Object.defineProperty(global, "sessionStorage", {
      value: originalSessionStorage,
      writable: true,
    });
  });

  describe("verifySessionTokens", () => {
    it("should return true when both tokens exist in sessionStorage", async () => {
      sessionStorage.setItem("accessToken", "test-access-token");
      sessionStorage.setItem("idToken", "test-id-token");

      const promise = verifySessionTokens();
      vi.advanceTimersByTime(2000);
      const result = await promise;

      expect(result).toBe(true);
    });

    it("should return false when accessToken is missing", async () => {
      sessionStorage.setItem("idToken", "test-id-token");

      const promise = verifySessionTokens();
      vi.advanceTimersByTime(2000);
      const result = await promise;

      expect(result).toBe(false);
    });

    it("should return false when idToken is missing", async () => {
      sessionStorage.setItem("accessToken", "test-access-token");

      const promise = verifySessionTokens();
      vi.advanceTimersByTime(2000);
      const result = await promise;

      expect(result).toBe(false);
    });

    it("should return false when both tokens are missing", async () => {
      const promise = verifySessionTokens();
      vi.advanceTimersByTime(2000);
      const result = await promise;

      expect(result).toBe(false);
    });

    it("should wait for 2 seconds by default before checking tokens", async () => {
      sessionStorage.setItem("accessToken", "test-access-token");
      sessionStorage.setItem("idToken", "test-id-token");

      const promise = verifySessionTokens();

      // Should not resolve immediately
      vi.advanceTimersByTime(1000);
      let resolved = false;
      promise.then(() => {
        resolved = true;
      });

      await Promise.resolve(); // Allow microtasks to run
      expect(resolved).toBe(false);

      // Should resolve after 2 seconds
      vi.advanceTimersByTime(1000);
      await promise;
      expect(resolved).toBe(true);
    });

    it("should accept custom delay via options", async () => {
      sessionStorage.setItem("accessToken", "test-access-token");
      sessionStorage.setItem("idToken", "test-id-token");

      const options: VerifySessionOptions = { delayMs: 5000 };
      const promise = verifySessionTokens(options);

      // Should not resolve after default 2 seconds
      vi.advanceTimersByTime(2000);
      let resolved = false;
      promise.then(() => {
        resolved = true;
      });
      await Promise.resolve();
      expect(resolved).toBe(false);

      // Should resolve after custom 5 seconds
      vi.advanceTimersByTime(3000);
      await promise;
      expect(resolved).toBe(true);
    });

    it("should accept custom accessTokenKey via options", async () => {
      sessionStorage.setItem("customAccessKey", "test-access-token");
      sessionStorage.setItem("idToken", "test-id-token");

      const options: VerifySessionOptions = { accessTokenKey: "customAccessKey" };
      const promise = verifySessionTokens(options);
      vi.advanceTimersByTime(2000);
      const result = await promise;

      expect(result).toBe(true);
    });

    it("should accept custom idTokenKey via options", async () => {
      sessionStorage.setItem("accessToken", "test-access-token");
      sessionStorage.setItem("customIdKey", "test-id-token");

      const options: VerifySessionOptions = { idTokenKey: "customIdKey" };
      const promise = verifySessionTokens(options);
      vi.advanceTimersByTime(2000);
      const result = await promise;

      expect(result).toBe(true);
    });

    it("should accept all custom options together", async () => {
      sessionStorage.setItem("myAccessToken", "test-access-token");
      sessionStorage.setItem("myIdToken", "test-id-token");

      const options: VerifySessionOptions = {
        accessTokenKey: "myAccessToken",
        idTokenKey: "myIdToken",
        delayMs: 3000,
      };
      const promise = verifySessionTokens(options);
      vi.advanceTimersByTime(3000);
      const result = await promise;

      expect(result).toBe(true);
    });

    it("should return false with custom keys when tokens are missing", async () => {
      const options: VerifySessionOptions = {
        accessTokenKey: "customAccessKey",
        idTokenKey: "customIdKey",
      };
      const promise = verifySessionTokens(options);
      vi.advanceTimersByTime(2000);
      const result = await promise;

      expect(result).toBe(false);
    });

    it("should handle empty string tokens as falsy", async () => {
      sessionStorage.setItem("accessToken", "");
      sessionStorage.setItem("idToken", "test-id-token");

      const promise = verifySessionTokens();
      vi.advanceTimersByTime(2000);
      const result = await promise;

      expect(result).toBe(false);
    });

    it("should return true with non-empty string tokens", async () => {
      sessionStorage.setItem("accessToken", "valid-token");
      sessionStorage.setItem("idToken", "valid-token");

      const promise = verifySessionTokens();
      vi.advanceTimersByTime(2000);
      const result = await promise;

      expect(result).toBe(true);
    });

    it("should work with delay of 0ms", async () => {
      sessionStorage.setItem("accessToken", "test-access-token");
      sessionStorage.setItem("idToken", "test-id-token");

      const options: VerifySessionOptions = { delayMs: 0 };
      const promise = verifySessionTokens(options);
      vi.advanceTimersByTime(0);
      const result = await promise;

      expect(result).toBe(true);
    });
  });

  describe("requireSessionTokens", () => {
    it("should return true when both tokens exist", async () => {
      sessionStorage.setItem("accessToken", "test-access-token");
      sessionStorage.setItem("idToken", "test-id-token");

      const promise = requireSessionTokens();
      vi.advanceTimersByTime(2000);
      const result = await promise;

      expect(result).toBe(true);
    });

    it("should throw error when tokens are missing", async () => {
      const promise = requireSessionTokens();
      vi.advanceTimersByTime(2000);

      await expect(promise).rejects.toThrow("SESSION_TOKENS_MISSING");
    });

    it("should throw error when only accessToken exists", async () => {
      sessionStorage.setItem("accessToken", "test-access-token");

      const promise = requireSessionTokens();
      vi.advanceTimersByTime(2000);

      await expect(promise).rejects.toThrow("SESSION_TOKENS_MISSING");
    });

    it("should throw error when only idToken exists", async () => {
      sessionStorage.setItem("idToken", "test-id-token");

      const promise = requireSessionTokens();
      vi.advanceTimersByTime(2000);

      await expect(promise).rejects.toThrow("SESSION_TOKENS_MISSING");
    });

    it("should accept custom options", async () => {
      sessionStorage.setItem("customAccessKey", "test-access-token");
      sessionStorage.setItem("customIdKey", "test-id-token");

      const options: VerifySessionOptions = {
        accessTokenKey: "customAccessKey",
        idTokenKey: "customIdKey",
        delayMs: 1000,
      };
      const promise = requireSessionTokens(options);
      vi.advanceTimersByTime(1000);
      const result = await promise;

      expect(result).toBe(true);
    });

    it("should throw with custom options when tokens are missing", async () => {
      const options: VerifySessionOptions = {
        accessTokenKey: "customAccessKey",
        idTokenKey: "customIdKey",
      };
      const promise = requireSessionTokens(options);
      vi.advanceTimersByTime(2000);

      await expect(promise).rejects.toThrow("SESSION_TOKENS_MISSING");
    });

    it("should throw exact error message", async () => {
      const promise = requireSessionTokens();
      vi.advanceTimersByTime(2000);

      try {
        await promise;
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("SESSION_TOKENS_MISSING");
      }
    });

    it("should work without options parameter", async () => {
      sessionStorage.setItem("accessToken", "test-access-token");
      sessionStorage.setItem("idToken", "test-id-token");

      const promise = requireSessionTokens();
      vi.advanceTimersByTime(2000);
      const result = await promise;

      expect(result).toBe(true);
    });
  });

  describe("integration scenarios", () => {
    it("should simulate tokens being set during delay period", async () => {
      // Start verification before tokens exist
      const promise = verifySessionTokens();

      // Simulate tokens being set after 1 second (during the 2s delay)
      vi.advanceTimersByTime(1000);
      sessionStorage.setItem("accessToken", "test-access-token");
      sessionStorage.setItem("idToken", "test-id-token");

      // Complete the delay
      vi.advanceTimersByTime(1000);
      const result = await promise;

      expect(result).toBe(true);
    });

    it("should check tokens at the end of delay, not at the start", async () => {
      const promise = verifySessionTokens();

      // Advance 1.5 seconds and add tokens
      vi.advanceTimersByTime(1500);
      sessionStorage.setItem("accessToken", "test-access-token");
      sessionStorage.setItem("idToken", "test-id-token");

      // Complete the remaining 0.5 seconds
      vi.advanceTimersByTime(500);
      const result = await promise;

      expect(result).toBe(true);
    });

    it("should allow multiple concurrent verifications", async () => {
      sessionStorage.setItem("accessToken", "test-access-token");
      sessionStorage.setItem("idToken", "test-id-token");

      const promise1 = verifySessionTokens();
      const promise2 = verifySessionTokens({ delayMs: 1000 });
      const promise3 = verifySessionTokens({ delayMs: 3000 });

      vi.advanceTimersByTime(3000);

      const results = await Promise.all([promise1, promise2, promise3]);
      expect(results).toEqual([true, true, true]);
    });

    it("should handle tokens being removed during delay", async () => {
      sessionStorage.setItem("accessToken", "test-access-token");
      sessionStorage.setItem("idToken", "test-id-token");

      const promise = verifySessionTokens();

      // Remove tokens after 1 second
      vi.advanceTimersByTime(1000);
      sessionStorage.removeItem("accessToken");

      // Complete delay
      vi.advanceTimersByTime(1000);
      const result = await promise;

      expect(result).toBe(false);
    });
  });
});
