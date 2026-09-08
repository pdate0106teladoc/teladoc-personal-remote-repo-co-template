import { useCallback, useRef } from "react";
import api from "@/api/apiService";
import useEditStore from "@/store/editStore";
import { showCustomToast } from "@ucc/common-ui";
import {
  AUTO_SAVE_INTERVAL_MS,
  ERROR_MESSAGES,
  ToastType,
} from "@/constants";

type EntityType = "organizations" | "groups";

interface UseAutoSavePatchParams {
  entityType: EntityType;
  entityId: string;
  editBaseUrl: string;
}

interface UseAutoSavePatchReturn {
  handleSaveChanges: (
    pageName: string,
    changedPayload: Record<string, any>,
  ) => void;
  flushPendingSave: () => Promise<boolean>;
}

export const buildAutoSaveRetryToastMessage =
  (onRetry: () => void, customMessage?: React.ReactNode) =>
  (closeToast: () => void) => (
    <div>
      <div>{customMessage ?? ERROR_MESSAGES.AUTO_SAVE_RETRY_OR_SERVICE_DESK}</div>
      <button
        type="button"
        className="text-primary ellipsis-cell toast-link cursor-pointer"
        onClick={() => {
          onRetry();
          closeToast();
        }}
      >
        Try Again
      </button>
    </div>
  );

export const useAutoSavePatch = ({
  entityType,
  entityId,
  editBaseUrl,
}: UseAutoSavePatchParams): UseAutoSavePatchReturn => {
  const updateSavePayload = useEditStore((state) => state.updateSavePayload);
  const clearSavePayload = useEditStore((state) => state.clearSavePayload);
  const setIsSaving = useEditStore((state) => state.setIsSaving);
  const setLastSavedAt = useEditStore((state) => state.setLastSavedAt);
  const setSaveTimerId = useEditStore((state) => state.setSaveTimerId);

  const autoSaveFailureCountRef = useRef(0);

  const performAutoSavePatch = useCallback(async (): Promise<boolean> => {
    const payload = useEditStore.getState().savePayload;

    if (Object.keys(payload).length === 0) {
      setIsSaving(false);
      return true;
    }

    setIsSaving(true);

    try {
      await api.patch(
        `${editBaseUrl}client-configurations/${entityType}/${entityId}`,
        payload,
      );

      setLastSavedAt(new Date().toISOString());
      setIsSaving(false);
      clearSavePayload();
      setSaveTimerId(null);
      return true;
    } catch {
      setIsSaving(false);
      return false;
    }
  }, [
    entityType,
    entityId,
    editBaseUrl,
    setIsSaving,
    setLastSavedAt,
    clearSavePayload,
    setSaveTimerId,
  ]);

  const runAutoSaveWithToasts = useCallback(async () => {
    const ok = await performAutoSavePatch();

    if (ok) {
      autoSaveFailureCountRef.current = 0;
      showCustomToast({
        type: ToastType.Success,
        title: "Success",
        message: "Changes saved successfully",
      });
      return;
    }

    autoSaveFailureCountRef.current += 1;

    if (autoSaveFailureCountRef.current === 1) {
      showCustomToast({
        type: ToastType.Error,
        title: "Unable to save your changes",
        message: buildAutoSaveRetryToastMessage(() => {
          void runAutoSaveWithToasts();
        }),
      });
    } else {
      showCustomToast({
        type: ToastType.Error,
        title: "Unable to save your changes",
        message: ERROR_MESSAGES.AUTO_SAVE_CONTACT_SERVICE_DESK_ONLY,
      });
    }
  }, [performAutoSavePatch]);

  const handleSaveChanges = useCallback(
    (pageName: string, changedPayload: Record<string, any>) => {
      const currentTimerId = useEditStore.getState().saveTimerId;
      if (currentTimerId) {
        clearTimeout(currentTimerId);
        setSaveTimerId(null);
      }

      updateSavePayload(pageName, changedPayload);
      autoSaveFailureCountRef.current = 0;

      const newTimerId = setTimeout(() => {
        void runAutoSaveWithToasts();
      }, AUTO_SAVE_INTERVAL_MS);

      setSaveTimerId(newTimerId);
    },
    [updateSavePayload, setSaveTimerId, runAutoSaveWithToasts],
  );

  const flushPendingSave = useCallback(async (): Promise<boolean> => {
    const currentTimerId = useEditStore.getState().saveTimerId;
    if (currentTimerId) {
      clearTimeout(currentTimerId);
      setSaveTimerId(null);
    }
    const payload = useEditStore.getState().savePayload;
    if (Object.keys(payload).length === 0) return true;
    return await performAutoSavePatch();
  }, [performAutoSavePatch, setSaveTimerId]);

  return { handleSaveChanges, flushPendingSave };
};
