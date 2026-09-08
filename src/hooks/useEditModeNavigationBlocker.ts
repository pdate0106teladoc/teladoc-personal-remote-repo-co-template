import { useCallback, useEffect, useRef, useState } from "react";
import type { NavigateFunction, NavigateOptions } from "react-router-dom";

type PendingNavigationType = "POP" | "PUSH" | "REPLACE";

interface PendingNavigation {
  type: PendingNavigationType;
  url?: string;
}

interface UseEditModeNavigationBlockerOptions {
  isEditMode: boolean;
  navigate: NavigateFunction;
}

interface ConfirmNavigationOptions {
  fallbackUrl?: string | null;
  onBeforeNavigate?: () => void;
}

const EDIT_BLOCKER_STATE_KEY = "__uccEditModeBlocker";

const getCurrentNavigationPath = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

const getNavigationPath = (target: string) => {
  try {
    const url = new URL(target, window.location.origin);
    if (url.origin === window.location.origin) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return target;
  }
  return target;
};

const TASK_SESSION_PATH_SEGMENTS = ["/edit/", "/review/"] as const;

const isTaskSessionPath = (target: string) =>
  TASK_SESSION_PATH_SEGMENTS.some((segment) => target.includes(segment));

const shouldBlockNavigation = (target: string) =>
  Boolean(target) &&
  !isTaskSessionPath(target) &&
  !target.includes("session-timeout");

const getBlockerState = (state: unknown) => {
  if (!state || typeof state !== "object") return null;
  const value = (state as Record<string, unknown>)[EDIT_BLOCKER_STATE_KEY];
  if (!value || typeof value !== "object") return null;
  const marker = value as { kind?: unknown; sessionId?: unknown };
  if (
    (marker.kind === "base" || marker.kind === "guard") &&
    typeof marker.sessionId === "string"
  ) {
    return marker as { kind: "base" | "guard"; sessionId: string };
  }
  return null;
};

const withBlockerState = (
  state: unknown,
  sessionId: string,
  kind: "base" | "guard",
  incrementIndex = false,
) => {
  const nextState =
    state && typeof state === "object"
      ? { ...(state as Record<string, unknown>) }
      : {};

  if (incrementIndex && typeof nextState.idx === "number") {
    nextState.idx += 1;
  }

  nextState[EDIT_BLOCKER_STATE_KEY] = { kind, sessionId };
  return nextState;
};

export const useEditModeNavigationBlocker = ({
  isEditMode,
  navigate,
}: UseEditModeNavigationBlockerOptions) => {
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const pendingNavigation = useRef<PendingNavigation | null>(null);
  const skipNextNavigation = useRef(false);
  const sessionId = useRef(
    `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const currentEditPath = useRef(getCurrentNavigationPath());

  useEffect(() => {
    if (isEditMode) {
      currentEditPath.current = getCurrentNavigationPath();
    }
  });

  const blockNavigation = useCallback((navigation: PendingNavigation) => {
    pendingNavigation.current = navigation;
    setIsExitModalOpen(true);
  }, []);

  const cancelBlockedNavigation = useCallback(() => {
    pendingNavigation.current = null;
    setIsExitModalOpen(false);
  }, []);

  const requestExitConfirmation = useCallback(
    (url?: string | null) => {
      if (!isEditMode) {
        if (url) navigate(url);
        return;
      }

      blockNavigation({ type: "PUSH", url: url ?? undefined });
    },
    [blockNavigation, isEditMode, navigate],
  );

  const confirmBlockedNavigation = useCallback(
    ({ fallbackUrl, onBeforeNavigate }: ConfirmNavigationOptions = {}) => {
      const navigation = pendingNavigation.current;
      const destination = navigation?.url ?? fallbackUrl ?? null;

      pendingNavigation.current = null;
      setIsExitModalOpen(false);
      skipNextNavigation.current = true;
      onBeforeNavigate?.();

      if (navigation?.type === "POP" && !navigation.url) {
        window.history.go(-2);
        return;
      }

      if (destination) {
        navigate(destination, {
          replace: navigation?.type === "REPLACE",
        });
      }
    },
    [navigate],
  );

  const navigateWithoutPrompt = useCallback(
    (
      url: string,
      onBeforeNavigate?: () => void,
      options?: NavigateOptions,
    ) => {
      pendingNavigation.current = null;
      setIsExitModalOpen(false);
      skipNextNavigation.current = true;
      onBeforeNavigate?.();
      navigate(url, options);
    },
    [navigate],
  );

  useEffect(() => {
    if (!isEditMode) {
      pendingNavigation.current = null;
      skipNextNavigation.current = false;
      setIsExitModalOpen(false);
      return;
    }

    skipNextNavigation.current = false;

    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(
      window.history,
    );

    const pushGuardEntry = () => {
      const marker = getBlockerState(window.history.state);
      if (
        marker?.kind === "guard" &&
        marker.sessionId === sessionId.current
      ) {
        return;
      }

      const baseState = withBlockerState(
        window.history.state,
        sessionId.current,
        "base",
      );
      originalReplaceState(baseState, "", currentEditPath.current);
      originalPushState(
        withBlockerState(baseState, sessionId.current, "guard", true),
        "",
        currentEditPath.current,
      );
    };

    (window.history as History).pushState = (
      state: unknown,
      title: string,
      url?: string | URL | null,
    ) => {
      const target = url ? getNavigationPath(String(url)) : "";
      if (!skipNextNavigation.current && shouldBlockNavigation(target)) {
        blockNavigation({ type: "PUSH", url: target });
        return;
      }
      originalPushState(state, title, url);
    };

    (window.history as History).replaceState = (
      state: unknown,
      title: string,
      url?: string | URL | null,
    ) => {
      const target = url ? getNavigationPath(String(url)) : "";
      if (!skipNextNavigation.current && shouldBlockNavigation(target)) {
        blockNavigation({ type: "REPLACE", url: target });
        return;
      }
      originalReplaceState(state, title, url);
    };

    const handlePopState = (event: PopStateEvent) => {
      if (skipNextNavigation.current) return;

      const blockerState = getBlockerState(event.state);
      if (
        blockerState?.kind === "base" &&
        blockerState.sessionId === sessionId.current
      ) {
        event.stopImmediatePropagation();
        blockNavigation({ type: "POP" });
        pushGuardEntry();
        return;
      }

      const target = getCurrentNavigationPath();
      if (shouldBlockNavigation(target)) {
        event.stopImmediatePropagation();
        blockNavigation({ type: "POP", url: target });
        originalPushState(
          withBlockerState(
            window.history.state,
            sessionId.current,
            "guard",
            true,
          ),
          "",
          currentEditPath.current,
        );
      }
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        skipNextNavigation.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }

      const element = event.target instanceof Element ? event.target : null;
      const anchor = element?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const url = new URL(anchor.href, window.location.origin);
      if (url.origin !== window.location.origin) return;

      const target = `${url.pathname}${url.search}${url.hash}`;
      if (shouldBlockNavigation(target)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        blockNavigation({ type: "PUSH", url: target });
      }
    };

    pushGuardEntry();
    window.addEventListener("popstate", handlePopState, true);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handlePopState, true);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [blockNavigation, isEditMode]);

  return {
    isExitModalOpen,
    cancelBlockedNavigation,
    confirmBlockedNavigation,
    navigateWithoutPrompt,
    requestExitConfirmation,
  };
};
