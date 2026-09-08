import api from "@/api/apiService";
import { API_ENDPOINTS } from "@/constants";
import useReviewStore from "@/store/useReviewStore";
import {
  transformChangesToPages,
  type ReviewChangeResponse,
} from "./reviewFieldRegistry";

async function resolveReviewFieldPathByUiKey(
  candidateId: string,
  taskUrl: string,
): Promise<Record<string, string>> {
  const fromStore = useReviewStore.getState().reviewFieldPathByUiKey;
  if (Object.keys(fromStore).length > 0) {
    return fromStore;
  }

  const res: { diff?: ReviewChangeResponse } = await api.get(
    `${taskUrl}${API_ENDPOINTS.approveTask}/${candidateId}/review`,
  );
  const { fieldPathMap } = transformChangesToPages(res?.diff);
  if (Object.keys(fieldPathMap).length > 0) {
    useReviewStore.getState().setReviewFieldPathByUiKey(fieldPathMap);
  }
  return fieldPathMap;
}

/** Persist reviewer fail-checkbox selections when exiting review without completing. */
export async function saveReviewerMarkedFailedFields({
  candidateId,
  taskUrl,
}: {
  candidateId: string;
  taskUrl: string;
}): Promise<void> {
  const failedFields = useReviewStore.getState().failedFields;
  if (failedFields.size === 0) return;

  const fieldPathMap = await resolveReviewFieldPathByUiKey(candidateId, taskUrl);
  const failedFieldPaths = [...failedFields]
    .map((uiKey) => fieldPathMap[uiKey])
    .filter(Boolean);

  if (failedFieldPaths.length === 0) {
    console.warn(
      "[saveReviewerMarkedFailedFields] No field paths resolved for marked failed fields.",
    );
    return;
  }

  await api.put(
    `${taskUrl}${API_ENDPOINTS.approveTask}/${candidateId}/review`,
    { failedFields: failedFieldPaths },
  );
}
