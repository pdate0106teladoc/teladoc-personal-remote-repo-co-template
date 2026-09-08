import { describe, it, expect, vi, beforeEach } from "vitest";
import { StrictMode } from "react";
import { render, act } from "@testing-library/react";

const post = vi.fn().mockResolvedValue({});
const get = vi.fn().mockResolvedValue({ reviewReferenceList: [] });

vi.mock("@/api/apiService", () => ({
  __esModule: true,
  default: { post: (...a: any[]) => post(...a), get: (...a: any[]) => get(...a) },
}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ candidateId: "O-01114" }),
  useNavigate: () => vi.fn(),
}));

vi.mock("@ucc/common-ui", () => ({
  FailSafePage: () => null,
  Loader: () => null,
  SideModal: () => null,
  showCustomToast: vi.fn(),
  extractDisplayValue: (v: unknown) => ({ raw: v, jsx: null }),
}));

vi.mock("@/hooks/useTaskComments", () => ({
  useTaskComments: () => ({ comments: [], isLoading: false, isSubmitting: false, sendComment: vi.fn() }),
}));

vi.mock("../ConfigReview.scss", () => ({}));
vi.mock("../ReviewCommentsPanel", () => ({ default: () => null }));
vi.mock("../ReviewInProgressView", () => ({
  default: () => null,
  REVIEW_ADDITIONAL_RESOURCES: [],
  ShowAllFieldsToggle: () => null,
}));
vi.mock("../ReviewRejectedView", () => ({ default: () => null }));
vi.mock("../CompleteReviewModal", () => ({ default: () => null }));
vi.mock("@/components/sidebar/TaskDetailSidebar", () => ({ default: () => null }));

import ConfigReview from "../ConfigReview";

const statusUpdateCalls = () =>
  post.mock.calls.filter(([url]) => String(url).includes("/statusUpdate"));

describe("ConfigReview statusUpdate claim", () => {
  beforeEach(() => {
    post.mockClear();
    get.mockClear();
    get.mockResolvedValue({ reviewReferenceList: [] });
  });

  it("posts the claim exactly once under StrictMode", async () => {
    await act(async () => {
      render(
        <StrictMode>
          <ConfigReview taskDetails={{ status: "PENDING_QUALITY_REVIEW" }} />
        </StrictMode>,
      );
    });

    expect(statusUpdateCalls()).toHaveLength(1);
    expect(statusUpdateCalls()[0][1]).toEqual({ action: "QUALITY_REVIEW_IN_PROGRESS" });
  });

  it("does not re-post when the component re-renders with the same status", async () => {
    let rerender: any;
    await act(async () => {
      ({ rerender } = render(
        <StrictMode>
          <ConfigReview taskDetails={{ status: "PENDING_REBUTTAL_REVIEW" }} />
        </StrictMode>,
      ));
    });
    await act(async () => {
      // New taskDetails object, same status — as a task-details refetch would produce.
      rerender(
        <StrictMode>
          <ConfigReview taskDetails={{ status: "PENDING_REBUTTAL_REVIEW" }} />
        </StrictMode>,
      );
    });

    expect(statusUpdateCalls()).toHaveLength(1);
    expect(statusUpdateCalls()[0][1]).toEqual({ action: "REBUTTAL_IN_PROGRESS" });
  });

  it("posts nothing when the status is not pending", async () => {
    await act(async () => {
      render(
        <StrictMode>
          <ConfigReview taskDetails={{ status: "QUALITY_REVIEW_IN_PROGRESS" }} />
        </StrictMode>,
      );
    });

    expect(statusUpdateCalls()).toHaveLength(0);
  });

  it("claims once when the status arrives after the first render", async () => {
    let rerender: any;
    await act(async () => {
      ({ rerender } = render(
        <StrictMode>
          <ConfigReview taskDetails={undefined} />
        </StrictMode>,
      ));
    });
    expect(statusUpdateCalls()).toHaveLength(0);

    await act(async () => {
      rerender(
        <StrictMode>
          <ConfigReview taskDetails={{ status: "PENDING_PEER_REVIEW" }} />
        </StrictMode>,
      );
    });

    expect(statusUpdateCalls()).toHaveLength(1);
    expect(statusUpdateCalls()[0][1]).toEqual({ action: "PEER_REVIEW_IN_PROGRESS" });
  });
});
