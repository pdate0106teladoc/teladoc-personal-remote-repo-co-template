import axiosInstance from "./axiosInstance";
import { type AxiosResponse, type AxiosError } from "axios";
import { vi } from "vitest";

describe("axiosInstance default configuration", () => {
  it("should set baseURL from environment variable", () => {
    expect(axiosInstance.defaults.baseURL).toBe(import.meta.env.VITE_API_URL);
  });

  it("should set default Content-Type header to application/json", () => {
    const headers = axiosInstance.defaults.headers;
    // axiosInstance.defaults.headers can be a common object or nested under headers.common
    const contentType =
      (headers as any)["Content-Type"] ||
      (headers.common as any)["Content-Type"];
    expect(contentType).toBe("application/json");
  });

  it("should set timeout to 10000 ms", () => {
    expect(axiosInstance.defaults.timeout).toBe(10000);
  });
});

describe("axiosInstance response interceptor", () => {
  let fulfilledHandler: (value: AxiosResponse) => AxiosResponse;
  let rejectedHandler: (error: any) => Promise<never>;

  beforeAll(() => {
    const handlers = (axiosInstance.interceptors.response as any).handlers;
    // The first interceptor should be the one we defined
    const interceptor = handlers[0];
    fulfilledHandler = interceptor.fulfilled;
    rejectedHandler = interceptor.rejected;
  });

  it("should return the response unchanged on success", () => {
    const mockResponse = { data: { foo: "bar" } } as AxiosResponse;
    const result = fulfilledHandler(mockResponse);
    expect(result).toBe(mockResponse);
  });

  it("should log error and reject promise on error", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => { });
    const mockError = new Error("Network Error") as AxiosError;
    try {
      await rejectedHandler(mockError);
      // If it does not throw, fail the test
      throw new Error("rejectedHandler did not throw");
    } catch (err) {
      expect(err).toBe(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith("API Error:", mockError);
    }
    consoleErrorSpy.mockRestore();
  });
});

describe("axiosInstance request interceptor (Authorization header)", () => {
  let fulfilledHandler: (config: any) => any;

  beforeAll(() => {
    // Find the request interceptor handler
    const handlers = (axiosInstance.interceptors.request as any).handlers;
    const interceptor = handlers[0];
    fulfilledHandler = interceptor.fulfilled;
  });

  beforeAll(() => {
    const store: Record<string, string> = {};
    Object.defineProperty(global, "localStorage", {
      value: {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          for (const key in store) delete store[key];
        }),
      },
      writable: true,
    });
  });

  it("adds Authorization header when accessToken exists in localStorage", async () => {
    sessionStorage.setItem("accessToken", "TEST_TOKEN");
    const config = { headers: {} };
    const result = await fulfilledHandler(config);
    expect(result.headers.Authorization).toBe("Bearer TEST_TOKEN");
  });

  it("does NOT add Authorization header when accessToken does not exist", async () => {
    sessionStorage.removeItem("accessToken");
    const config = { headers: {} };
    const result = await fulfilledHandler(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it("preserves other headers when adding Authorization", async () => {
    sessionStorage.setItem("accessToken", "FAKE_TOKEN");
    const config = { headers: { "X-Other-Header": "123" } };
    const result = await fulfilledHandler(config);
    expect(result.headers["X-Other-Header"]).toBe("123");
    expect(result.headers.Authorization).toBe("Bearer FAKE_TOKEN");
  });

  it("does not throw if window is undefined (SSR)", async () => {
    const originalWindow = global.window;
    const config = { headers: {} };
    expect(() => fulfilledHandler(config)).not.toThrow();
    global.window = originalWindow;
  });
});

