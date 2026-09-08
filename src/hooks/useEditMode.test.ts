import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("react-router-dom", () => ({
  useLocation: vi.fn(),
}));

vi.mock("@/store/editStore", () => {
  const mockState = {
    editMetadata: { field1: "meta1" },
    editFormData: { field1: "value1" },
    editOriginalData: { field1: "original1" },
    editErrors: {},
    editHasChanges: false,
    liveEntityData: null,
    setEditMetadata: vi.fn(),
    setEditFormData: vi.fn(),
    setEditOriginalData: vi.fn(),
    setEditErrors: vi.fn(),
    setEditHasChanges: vi.fn(),
    updateEditFormField: vi.fn(),
    updateLiveEntityField: vi.fn(),
    clearEditState: vi.fn(),
    setLiveEntityData: vi.fn(),
  };
  const useEditStore = (selector: (s: typeof mockState) => any) =>
    selector(mockState);
  useEditStore.__mockState = mockState;
  return { default: useEditStore };
});

import { useLocation } from "react-router-dom";
import { useEditMode, useEditModeInit } from "./useEditMode";

const mockedUseLocation = vi.mocked(useLocation);

describe("useEditMode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns mode 'edit' when pathname contains /edit/", () => {
    mockedUseLocation.mockReturnValue({
      pathname: "/CCC/org-detail/123/edit/candidate-1",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    const { result } = renderHook(() => useEditMode());
    expect(result.current.mode).toBe("edit");
  });

  it("returns mode 'view' when pathname does not contain /edit/", () => {
    mockedUseLocation.mockReturnValue({
      pathname: "/CCC/org-detail/123",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    const { result } = renderHook(() => useEditMode());
    expect(result.current.mode).toBe("view");
  });

  it("returns state properties from editStore", () => {
    mockedUseLocation.mockReturnValue({
      pathname: "/CCC/org-detail/123",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    const { result } = renderHook(() => useEditMode());
    expect(result.current.metadata).toEqual({ field1: "meta1" });
    expect(result.current.formData).toEqual({ field1: "value1" });
    expect(result.current.originalData).toEqual({ field1: "original1" });
    expect(result.current.errors).toEqual({});
    expect(result.current.hasChanges).toBe(false);
    expect(result.current.liveEntityData).toBeNull();
  });

  it("returns action functions from editStore", () => {
    mockedUseLocation.mockReturnValue({
      pathname: "/CCC/org-detail/123",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    const { result } = renderHook(() => useEditMode());
    expect(result.current.setMetadata).toBeTypeOf("function");
    expect(result.current.setFormData).toBeTypeOf("function");
    expect(result.current.setOriginalData).toBeTypeOf("function");
    expect(result.current.setErrors).toBeTypeOf("function");
    expect(result.current.setHasChanges).toBeTypeOf("function");
    expect(result.current.updateField).toBeTypeOf("function");
    expect(result.current.updateLiveEntityField).toBeTypeOf("function");
    expect(result.current.clearState).toBeTypeOf("function");
    expect(result.current.setLiveEntityData).toBeTypeOf("function");
  });
});

describe("useEditModeInit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls fetchMetadata when mode is edit", async () => {
    mockedUseLocation.mockReturnValue({
      pathname: "/CCC/org-detail/123/edit/candidate-1",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    const fetchMetadata = vi.fn().mockResolvedValue({ sections: [] });
    renderHook(() => useEditModeInit(fetchMetadata));

    await vi.waitFor(() => {
      expect(fetchMetadata).toHaveBeenCalled();
    });
  });

  it("does not call fetchMetadata when mode is view", () => {
    mockedUseLocation.mockReturnValue({
      pathname: "/CCC/org-detail/123",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    const fetchMetadata = vi.fn().mockResolvedValue({});
    renderHook(() => useEditModeInit(fetchMetadata));

    expect(fetchMetadata).not.toHaveBeenCalled();
  });

  it("returns the same shape as useEditMode", () => {
    mockedUseLocation.mockReturnValue({
      pathname: "/CCC/org-detail/123",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    const fetchMetadata = vi.fn().mockResolvedValue({});
    const { result } = renderHook(() => useEditModeInit(fetchMetadata));

    expect(result.current).toHaveProperty("mode");
    expect(result.current).toHaveProperty("metadata");
    expect(result.current).toHaveProperty("formData");
    expect(result.current).toHaveProperty("setMetadata");
    expect(result.current).toHaveProperty("clearState");
  });
});
