import api from "@/api/apiService";
import { API_ENDPOINTS } from "@/constants";
import useEditStore from "@/store/editStore";
import useReviewStore from "@/store/useReviewStore";
import {
  buildCorrectedFieldsPayload,
  buildRejectedReviewFieldPathMapFromReviewDiff,
  type ReviewChangeResponse,
} from "./reviewFieldRegistry";

export async function resolveRejectedReviewFieldPathMap(
  candidateId: string,
  taskUrl: string,
): Promise<Record<string, string>> {
  const fromStore = useReviewStore.getState().rejectedReviewFieldPathByFormKey;
  if (Object.keys(fromStore).length > 0) {
    return fromStore;
  }

  const res: { diff?: ReviewChangeResponse } = await api.get(
    `${taskUrl}${API_ENDPOINTS.approveTask}/${candidateId}/review`,
  );

  const pathMap = buildRejectedReviewFieldPathMapFromReviewDiff(res?.diff);
  if (Object.keys(pathMap).length > 0) {
    useReviewStore.getState().setRejectedReviewFieldPathByFormKey(pathMap);
  }
  return pathMap;
}

/** PUT corrected field values after reviewer rejection (before submit modal). */
export async function submitRejectedReviewCorrections({
  candidateId,
  taskUrl,
}: {
  candidateId: string;
  taskUrl: string;
}): Promise<void> {
  const pathMap = await resolveRejectedReviewFieldPathMap(candidateId, taskUrl);
  const formData = useEditStore.getState().editFormData;
  const correctedFields = buildCorrectedFieldsPayload(pathMap, formData);

  if (correctedFields.length === 0) {
    console.warn(
      "[submitRejectedReviewCorrections] No corrected fields — rejected review path map is empty.",
    );
    return;
  }

  await api.put(
    `${taskUrl}${API_ENDPOINTS.approveTask}/${candidateId}/review`,
    { correctedFields },
  );
}
