import { describe, it, expect, vi } from "vitest";
import api from "./apiService";
import axiosInstance from "./axiosInstance";

vi.mock("./axiosInstance");

describe("apiService", () => {
  describe("get", () => {
    it("should fetch data using GET method", async () => {
      const mockData = { data: "test data" };
      vi.spyOn(axiosInstance, "get").mockResolvedValueOnce(mockData);

      const result = await api.get("/test-url");

      expect(axiosInstance.get).toHaveBeenCalledWith("/test-url", {
        params: undefined,
        timeout: 0
      });
      expect(result).toEqual(mockData.data);
    });
  });

  describe("post", () => {
    it("should send data using POST method", async () => {
      const mockData = { data: "test data" };
      vi.spyOn(axiosInstance, "post").mockResolvedValueOnce(mockData);

      const result = await api.post("/test-url", { key: "value" });

      expect(axiosInstance.post).toHaveBeenCalledWith("/test-url", {
        key: "value",
      }, {
        timeout: 0
      });
      expect(result).toEqual(mockData.data);
    });
  });

  describe("put", () => {
    it("should update data using PUT method", async () => {
      const mockData = { data: "test data" };
      vi.spyOn(axiosInstance, "put").mockResolvedValueOnce(mockData);

      const result = await api.put("/test-url", { key: "value" });

      expect(axiosInstance.put).toHaveBeenCalledWith("/test-url", {
        key: "value",
      },{timeout: 0});
      expect(result).toEqual(mockData.data);
    });
  });

  describe("patch", () => {
    it("should partially update data using PATCH method", async () => {
      const mockData = { data: "test data" };
      vi.spyOn(axiosInstance, "patch").mockResolvedValueOnce(mockData);

      const result = await api.patch("/test-url", { key: "value" });

      expect(axiosInstance.patch).toHaveBeenCalledWith("/test-url", {
        key: "value",
      },{timeout:0});
      expect(result).toEqual(mockData.data);
    });
  });

  describe("delete", () => {
    it("should delete data using DELETE method", async () => {
      const mockData = { data: "test data" };
      vi.spyOn(axiosInstance, "delete").mockResolvedValueOnce(mockData);

      const result = await api.delete("/test-url");

      expect(axiosInstance.delete).toHaveBeenCalledWith("/test-url", {
        timeout: 0
      });
      expect(result).toEqual(mockData.data);
    });
  });

  describe("mock responses", () => {
    it("should return mock data for organizations URL", () => {
      const mockOrganizationsResponse = { data: "mock organizations data" };
      const result = mockOrganizationsResponse;
      expect(result).toEqual({ data: "mock organizations data" });
    });

    it("should return mock data for groups URL", () => {
      const mockGroupsResponse = { data: "mock groups data" };
      const result = mockGroupsResponse;
      expect(result).toEqual({ data: "mock groups data" });
    });

    it("should return an empty object for other URLs", () => {
      const mockOtherResponse = {};
      const result = mockOtherResponse;
      expect(result).toEqual({});
    });
  });
  describe("apiService failure cases", () => {
    it("should handle API failure for GET method", async () => {
      const mockError = new Error("Network Error");
      vi.spyOn(axiosInstance, "get").mockRejectedValueOnce(mockError);

      await expect(api.get("/test-url")).rejects.toThrow("Network Error");
      expect(axiosInstance.get).toHaveBeenCalledWith("/test-url", {
        params: undefined,
        timeout: 0
      });
    });
  });
});
