import { act } from "react-dom/test-utils";
import { describe, it, expect, beforeEach } from "vitest";
import useEditStore, { getSavePayload, getPageSavePayload } from "../editStore";

const initialState = {
  editMetadata: {},
  editFormData: {},
  editOriginalData: {},
  editErrors: {},
  editHasChanges: false,
  liveEntityData: {},
  savePayload: {},
  isSaving: false,
  lastSavedAt: null,
  saveTimerId: null,
};

const resetStore = () => {
  act(() => {
    useEditStore.setState(initialState);
  });
};

describe("editStore", () => {
  beforeEach(resetStore);

  // ── Initial state ─────────────────────────────────────────────────────────────

  it("has correct initial state", () => {
    const state = useEditStore.getState();
    expect(state.editMetadata).toEqual({});
    expect(state.editFormData).toEqual({});
    expect(state.editOriginalData).toEqual({});
    expect(state.editErrors).toEqual({});
    expect(state.editHasChanges).toBe(false);
    expect(state.liveEntityData).toEqual({});
    expect(state.savePayload).toEqual({});
    expect(state.isSaving).toBe(false);
    expect(state.lastSavedAt).toBeNull();
    expect(state.saveTimerId).toBeNull();
  });

  // ── setEditMetadata ───────────────────────────────────────────────────────────

  it("setEditMetadata stores the provided metadata", () => {
    const metadata = { field1: { editable: true }, field2: { editable: false } };
    act(() => { useEditStore.getState().setEditMetadata(metadata); });
    expect(useEditStore.getState().editMetadata).toEqual(metadata);
  });

  it("setEditMetadata replaces previous metadata entirely", () => {
    act(() => { useEditStore.getState().setEditMetadata({ old: "value" }); });
    act(() => { useEditStore.getState().setEditMetadata({ new: "data" }); });
    expect(useEditStore.getState().editMetadata).toEqual({ new: "data" });
  });

  // ── setEditFormData ───────────────────────────────────────────────────────────

  it("setEditFormData stores the provided form data", () => {
    const data = { name: "Acme", status: "active" };
    act(() => { useEditStore.getState().setEditFormData(data); });
    expect(useEditStore.getState().editFormData).toEqual(data);
  });

  it("setEditFormData replaces previous form data entirely", () => {
    act(() => { useEditStore.getState().setEditFormData({ a: 1 }); });
    act(() => { useEditStore.getState().setEditFormData({ b: 2 }); });
    expect(useEditStore.getState().editFormData).toEqual({ b: 2 });
  });

  // ── setEditOriginalData ───────────────────────────────────────────────────────

  it("setEditOriginalData stores the provided original data", () => {
    const original = { name: "Original Name", status: "inactive" };
    act(() => { useEditStore.getState().setEditOriginalData(original); });
    expect(useEditStore.getState().editOriginalData).toEqual(original);
  });

  // ── setEditErrors ─────────────────────────────────────────────────────────────

  it("setEditErrors stores the provided errors", () => {
    const errors = { name: "Required", email: "Invalid format" };
    act(() => { useEditStore.getState().setEditErrors(errors); });
    expect(useEditStore.getState().editErrors).toEqual(errors);
  });

  it("setEditErrors replaces previous errors", () => {
    act(() => { useEditStore.getState().setEditErrors({ name: "Required" }); });
    act(() => { useEditStore.getState().setEditErrors({ email: "Invalid" }); });
    expect(useEditStore.getState().editErrors).toEqual({ email: "Invalid" });
  });

  it("setEditErrors clears errors when called with empty object", () => {
    act(() => { useEditStore.getState().setEditErrors({ name: "Required" }); });
    act(() => { useEditStore.getState().setEditErrors({}); });
    expect(useEditStore.getState().editErrors).toEqual({});
  });

  // ── setEditHasChanges ─────────────────────────────────────────────────────────

  it("setEditHasChanges sets the flag to true", () => {
    act(() => { useEditStore.getState().setEditHasChanges(true); });
    expect(useEditStore.getState().editHasChanges).toBe(true);
  });

  it("setEditHasChanges sets the flag to false", () => {
    act(() => { useEditStore.getState().setEditHasChanges(true); });
    act(() => { useEditStore.getState().setEditHasChanges(false); });
    expect(useEditStore.getState().editHasChanges).toBe(false);
  });

  // ── updateEditFormField ───────────────────────────────────────────────────────

  it("updateEditFormField adds a new field to editFormData", () => {
    act(() => {
      useEditStore.getState().setEditOriginalData({ name: "Original" });
      useEditStore.getState().setEditFormData({ name: "Original" });
    });
    act(() => { useEditStore.getState().updateEditFormField("name", "Updated"); });
    expect(useEditStore.getState().editFormData.name).toBe("Updated");
  });

  it("updateEditFormField sets editHasChanges=true when value differs from original", () => {
    act(() => {
      useEditStore.getState().setEditOriginalData({ name: "Original" });
      useEditStore.getState().setEditFormData({ name: "Original" });
    });
    act(() => { useEditStore.getState().updateEditFormField("name", "Changed"); });
    expect(useEditStore.getState().editHasChanges).toBe(true);
  });

  it("updateEditFormField sets editHasChanges=false when updated value matches original", () => {
    act(() => {
      useEditStore.getState().setEditOriginalData({ name: "Same" });
      useEditStore.getState().setEditFormData({ name: "Same" });
    });
    act(() => { useEditStore.getState().updateEditFormField("name", "Same"); });
    expect(useEditStore.getState().editHasChanges).toBe(false);
  });

  it("updateEditFormField detects changes across multiple fields", () => {
    act(() => {
      useEditStore.getState().setEditOriginalData({ name: "A", status: "active" });
      useEditStore.getState().setEditFormData({ name: "A", status: "active" });
    });
    // Change one field — other fields still match original
    act(() => { useEditStore.getState().updateEditFormField("name", "B"); });
    expect(useEditStore.getState().editHasChanges).toBe(true);
    // Restore that field — all match original again
    act(() => { useEditStore.getState().updateEditFormField("name", "A"); });
    expect(useEditStore.getState().editHasChanges).toBe(false);
  });

  it("updateEditFormField preserves other existing fields in editFormData", () => {
    act(() => {
      useEditStore.getState().setEditFormData({ name: "Acme", status: "active" });
      useEditStore.getState().setEditOriginalData({ name: "Acme", status: "active" });
    });
    act(() => { useEditStore.getState().updateEditFormField("status", "inactive"); });
    expect(useEditStore.getState().editFormData.name).toBe("Acme");
    expect(useEditStore.getState().editFormData.status).toBe("inactive");
  });

  it("updateEditFormField works with non-string values", () => {
    act(() => {
      useEditStore.getState().setEditOriginalData({ count: 0 });
      useEditStore.getState().setEditFormData({ count: 0 });
    });
    act(() => { useEditStore.getState().updateEditFormField("count", 42); });
    expect(useEditStore.getState().editFormData.count).toBe(42);
    expect(useEditStore.getState().editHasChanges).toBe(true);
  });

  // ── updateLiveEntityField ─────────────────────────────────────────────────────

  it("updateLiveEntityField does nothing when liveEntityData is empty", () => {
    act(() => { useEditStore.getState().updateLiveEntityField("org.name", "Test"); });
    expect(useEditStore.getState().liveEntityData).toEqual({});
  });

  it("updateLiveEntityField updates a top-level field", () => {
    act(() => {
      useEditStore.getState().setLiveEntityData({ name: "Old", status: "active" });
    });
    act(() => { useEditStore.getState().updateLiveEntityField("name", "New"); });
    expect(useEditStore.getState().liveEntityData.name).toBe("New");
    expect(useEditStore.getState().liveEntityData.status).toBe("active");
  });

  it("updateLiveEntityField updates a nested field via dot-path", () => {
    act(() => {
      useEditStore.getState().setLiveEntityData({
        billing: { type: "monthly", amount: 100 },
      });
    });
    act(() => { useEditStore.getState().updateLiveEntityField("billing.type", "annual"); });
    expect(useEditStore.getState().liveEntityData.billing.type).toBe("annual");
    expect(useEditStore.getState().liveEntityData.billing.amount).toBe(100);
  });

  it("updateLiveEntityField updates a deeply nested field", () => {
    act(() => {
      useEditStore.getState().setLiveEntityData({
        org: { settings: { notifications: { email: true } } },
      });
    });
    act(() => {
      useEditStore.getState().updateLiveEntityField(
        "org.settings.notifications.email",
        false
      );
    });
    expect(
      useEditStore.getState().liveEntityData.org.settings.notifications.email
    ).toBe(false);
  });

  it("updateLiveEntityField does not mutate original liveEntityData reference", () => {
    const original = { name: "Acme" };
    act(() => { useEditStore.getState().setLiveEntityData(original); });
    act(() => { useEditStore.getState().updateLiveEntityField("name", "Updated"); });
    expect(original.name).toBe("Acme");
  });

  // ── setLiveEntityData ─────────────────────────────────────────────────────────

  it("setLiveEntityData stores the provided data", () => {
    const data = { id: "org-1", name: "Test Org" };
    act(() => { useEditStore.getState().setLiveEntityData(data); });
    expect(useEditStore.getState().liveEntityData).toEqual(data);
  });

  it("setLiveEntityData replaces previous live entity data", () => {
    act(() => { useEditStore.getState().setLiveEntityData({ a: 1 }); });
    act(() => { useEditStore.getState().setLiveEntityData({ b: 2 }); });
    expect(useEditStore.getState().liveEntityData).toEqual({ b: 2 });
  });

  // ── updateSavePayload ─────────────────────────────────────────────────────────

  it("updateSavePayload creates a new page entry", () => {
    const payload = { name: "Acme", status: "active" };
    act(() => { useEditStore.getState().updateSavePayload("billing", payload); });
    expect(useEditStore.getState().savePayload.billing).toEqual(payload);
  });

  it("updateSavePayload merges with existing page entries without overwriting others", () => {
    act(() => {
      useEditStore.getState().updateSavePayload("billing", { amount: 100 });
      useEditStore.getState().updateSavePayload("generalSettings", { name: "Acme" });
    });
    const { savePayload } = useEditStore.getState();
    expect(savePayload.billing).toEqual({ amount: 100 });
    expect(savePayload.generalSettings).toEqual({ name: "Acme" });
  });

  it("updateSavePayload replaces existing page payload with new one", () => {
    act(() => { useEditStore.getState().updateSavePayload("billing", { amount: 100 }); });
    act(() => { useEditStore.getState().updateSavePayload("billing", { amount: 200, type: "annual" }); });
    expect(useEditStore.getState().savePayload.billing).toEqual({ amount: 200, type: "annual" });
  });

  it("updateSavePayload accumulates multiple pages independently", () => {
    act(() => {
      useEditStore.getState().updateSavePayload("page1", { a: 1 });
      useEditStore.getState().updateSavePayload("page2", { b: 2 });
      useEditStore.getState().updateSavePayload("page3", { c: 3 });
    });
    const { savePayload } = useEditStore.getState();
    expect(Object.keys(savePayload)).toHaveLength(3);
    expect(savePayload.page1).toEqual({ a: 1 });
    expect(savePayload.page2).toEqual({ b: 2 });
    expect(savePayload.page3).toEqual({ c: 3 });
  });

  // ── clearSavePayload ──────────────────────────────────────────────────────────

  it("clearSavePayload empties the savePayload", () => {
    act(() => { useEditStore.getState().updateSavePayload("billing", { amount: 100 }); });
    act(() => { useEditStore.getState().clearSavePayload(); });
    expect(useEditStore.getState().savePayload).toEqual({});
  });

  it("clearSavePayload is safe to call when savePayload is already empty", () => {
    act(() => { useEditStore.getState().clearSavePayload(); });
    expect(useEditStore.getState().savePayload).toEqual({});
  });

  // ── Auto-save actions ─────────────────────────────────────────────────────────

  it("setIsSaving sets isSaving to true", () => {
    act(() => { useEditStore.getState().setIsSaving(true); });
    expect(useEditStore.getState().isSaving).toBe(true);
  });

  it("setIsSaving sets isSaving back to false", () => {
    act(() => { useEditStore.getState().setIsSaving(true); });
    act(() => { useEditStore.getState().setIsSaving(false); });
    expect(useEditStore.getState().isSaving).toBe(false);
  });

  it("setLastSavedAt stores a timestamp string", () => {
    const ts = "2025-04-17T10:30:00.000Z";
    act(() => { useEditStore.getState().setLastSavedAt(ts); });
    expect(useEditStore.getState().lastSavedAt).toBe(ts);
  });

  it("setLastSavedAt accepts null to clear the timestamp", () => {
    act(() => { useEditStore.getState().setLastSavedAt("2025-04-17T10:30:00.000Z"); });
    act(() => { useEditStore.getState().setLastSavedAt(null); });
    expect(useEditStore.getState().lastSavedAt).toBeNull();
  });

  it("setSaveTimerId stores a timer id", () => {
    const timerId = setTimeout(() => {}, 1000) as NodeJS.Timeout;
    act(() => { useEditStore.getState().setSaveTimerId(timerId); });
    expect(useEditStore.getState().saveTimerId).toBe(timerId);
    clearTimeout(timerId);
  });

  it("setSaveTimerId accepts null to clear the timer", () => {
    const timerId = setTimeout(() => {}, 1000) as NodeJS.Timeout;
    act(() => { useEditStore.getState().setSaveTimerId(timerId); });
    act(() => { useEditStore.getState().setSaveTimerId(null); });
    expect(useEditStore.getState().saveTimerId).toBeNull();
    clearTimeout(timerId);
  });

  // ── clearEditState ────────────────────────────────────────────────────────────

  it("clearEditState resets all fields to their initial values", () => {
    const timerId = setTimeout(() => {}, 1000) as NodeJS.Timeout;
    act(() => {
      useEditStore.getState().setEditMetadata({ field: "meta" });
      useEditStore.getState().setEditFormData({ name: "Acme" });
      useEditStore.getState().setEditOriginalData({ name: "Original" });
      useEditStore.getState().setEditErrors({ name: "Required" });
      useEditStore.getState().setEditHasChanges(true);
      useEditStore.getState().setLiveEntityData({ id: "org-1" });
      useEditStore.getState().updateSavePayload("billing", { amount: 100 });
      useEditStore.getState().setIsSaving(true);
      useEditStore.getState().setLastSavedAt("2025-04-17T10:00:00Z");
      useEditStore.getState().setSaveTimerId(timerId);
    });

    act(() => { useEditStore.getState().clearEditState(); });

    const state = useEditStore.getState();
    expect(state.editMetadata).toEqual({});
    expect(state.editFormData).toEqual({});
    expect(state.editOriginalData).toEqual({});
    expect(state.editErrors).toEqual({});
    expect(state.editHasChanges).toBe(false);
    expect(state.liveEntityData).toEqual({});
    expect(state.savePayload).toEqual({});
    expect(state.isSaving).toBe(false);
    expect(state.lastSavedAt).toBeNull();
    expect(state.saveTimerId).toBeNull();

    clearTimeout(timerId);
  });

  it("clearEditState is safe to call on already-cleared store", () => {
    act(() => { useEditStore.getState().clearEditState(); });
    act(() => { useEditStore.getState().clearEditState(); });
    expect(useEditStore.getState().editFormData).toEqual({});
  });

  // ── getSavePayload (exported helper) ─────────────────────────────────────────

  it("getSavePayload returns the current savePayload", () => {
    act(() => {
      useEditStore.getState().updateSavePayload("billing", { amount: 500 });
    });
    expect(getSavePayload()).toEqual({ billing: { amount: 500 } });
  });

  it("getSavePayload returns an empty object when savePayload is empty", () => {
    expect(getSavePayload()).toEqual({});
  });

  it("getSavePayload reflects updates after multiple updateSavePayload calls", () => {
    act(() => {
      useEditStore.getState().updateSavePayload("a", { x: 1 });
      useEditStore.getState().updateSavePayload("b", { y: 2 });
    });
    const payload = getSavePayload();
    expect(payload.a).toEqual({ x: 1 });
    expect(payload.b).toEqual({ y: 2 });
  });

  // ── getPageSavePayload (exported helper) ──────────────────────────────────────

  it("getPageSavePayload returns the payload for an existing page", () => {
    act(() => {
      useEditStore.getState().updateSavePayload("generalSettings", { name: "Org" });
    });
    expect(getPageSavePayload("generalSettings")).toEqual({ name: "Org" });
  });

  it("getPageSavePayload returns undefined for a page that has no payload", () => {
    expect(getPageSavePayload("nonExistentPage")).toBeUndefined();
  });

  it("getPageSavePayload is isolated per page name", () => {
    act(() => {
      useEditStore.getState().updateSavePayload("page1", { a: 1 });
      useEditStore.getState().updateSavePayload("page2", { b: 2 });
    });
    expect(getPageSavePayload("page1")).toEqual({ a: 1 });
    expect(getPageSavePayload("page2")).toEqual({ b: 2 });
    expect(getPageSavePayload("page3")).toBeUndefined();
  });

  it("getPageSavePayload reflects the latest payload after update", () => {
    act(() => { useEditStore.getState().updateSavePayload("billing", { amount: 100 }); });
    expect(getPageSavePayload("billing")).toEqual({ amount: 100 });

    act(() => { useEditStore.getState().updateSavePayload("billing", { amount: 999 }); });
    expect(getPageSavePayload("billing")).toEqual({ amount: 999 });
  });
});
