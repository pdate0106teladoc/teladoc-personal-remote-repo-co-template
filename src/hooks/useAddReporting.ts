import { useCallback, useRef, useState } from "react";
import { extractFormData } from "@/utils";
import { buildNewReportingMetadata } from "@/data/newReportingTemplate";

interface EditScope {
  metadata: any;
  formData: Record<string, any>;
  originalData: Record<string, any>;
}

interface UseAddReportingParams extends EditScope {
  setMetadata: (metadata: any) => void;
  setFormData: (formData: Record<string, any>) => void;
  setOriginalData: (originalData: Record<string, any>) => void;
  /** The page's init guard, so swapping scopes does not fire an autosave by itself. */
  isInitializing: React.MutableRefObject<boolean>;
}

interface UseAddReportingReturn {
  isAddingReport: boolean;
  /** Index the drafted report occupies in the reporting array. */
  newReportIndex: number;
  startAddReport: () => void;
  discardNewReport: () => void;
}

/** Matches the delay the reporting pages already use to release the init guard. */
const SCOPE_SWAP_SETTLE_MS = 100;

/**
 * "Add report" state for the org and group reporting pages.
 *
 * The blank report is appended to the metadata and form data the page already
 * holds, so the autosave diff keeps its existing behaviour of sending the whole
 * `reporting` array — every saved report plus the new one at the end. Its keys are
 * seeded into `originalData` too, so an untouched template does not by itself look
 * like a change. Discarding restores the scope captured before the append.
 */
export const useAddReporting = ({
  metadata,
  formData,
  originalData,
  setMetadata,
  setFormData,
  setOriginalData,
  isInitializing,
}: UseAddReportingParams): UseAddReportingReturn => {
  const [isAddingReport, setIsAddingReport] = useState(false);
  const [newReportIndex, setNewReportIndex] = useState(0);
  const savedScope = useRef<EditScope | null>(null);

  const swapScope = useCallback(
    (next: EditScope) => {
      isInitializing.current = true;
      setMetadata(next.metadata);
      setFormData(next.formData);
      setOriginalData(next.originalData);
      setTimeout(() => {
        isInitializing.current = false;
      }, SCOPE_SWAP_SETTLE_MS);
    },
    [isInitializing, setMetadata, setFormData, setOriginalData],
  );

  const startAddReport = useCallback(() => {
    savedScope.current = { metadata, formData, originalData };

    const existingReports = Array.isArray(metadata?.reporting)
      ? metadata.reporting
      : [];
    const index = existingReports.length;
    const template = buildNewReportingMetadata(metadata);
    // Keyed by the new index so the template's form keys are `reporting.<n>.*`.
    const templateFormData = extractFormData({ reporting: { [index]: template } });

    setNewReportIndex(index);
    setIsAddingReport(true);
    swapScope({
      metadata: { ...(metadata ?? {}), reporting: [...existingReports, template] },
      formData: { ...formData, ...templateFormData },
      originalData: { ...originalData, ...templateFormData },
    });
  }, [metadata, formData, originalData, swapScope]);

  const discardNewReport = useCallback(() => {
    const restored = savedScope.current;
    savedScope.current = null;
    setIsAddingReport(false);
    if (restored) swapScope(restored);
  }, [swapScope]);

  return { isAddingReport, newReportIndex, startAddReport, discardNewReport };
};
