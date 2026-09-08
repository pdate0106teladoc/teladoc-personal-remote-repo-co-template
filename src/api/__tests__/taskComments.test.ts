import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/api/apiService";
import {
  fetchTaskComments,
  getTaskCommentsUrl,
  postTaskComment,
} from "../taskComments";

vi.mock("@/api/apiService", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("taskComments", () => {
  const taskUrl = "https://task.test/v1/";
  const taskId = "O-00317";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds task comments url", () => {
    expect(getTaskCommentsUrl(taskUrl, taskId)).toBe(
      "https://task.test/v1/client-configurations/tasks/O-00317/comments",
    );
  });

  it("fetchTaskComments normalizes wrapped response", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        taskId: "O-00317",
        comments: [
          {
            commentId: "1",
            authorUserId: "u1",
            authorDisplayName: "Ashish Tiwari",
            authorRole: "Configurator",
            message: "Hello",
            commentType: "TASK_DISCUSSION",
            createdAt: "2026-04-23T14:30:00.000Z",
          },
        ],
      },
    });

    const result = await fetchTaskComments(taskUrl, taskId);

    expect(api.get).toHaveBeenCalledWith(
      "https://task.test/v1/client-configurations/tasks/O-00317/comments",
    );
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0].message).toBe("Hello");
  });

  it("postTaskComment sends message payload", async () => {
    vi.mocked(api.post).mockResolvedValue({
      commentId: "2",
      authorUserId: "u2",
      authorDisplayName: "Ashish Tiwari",
      authorRole: "Configurator",
      message: "Updated authorized consenters and billing zip code.",
      commentType: "TASK_DISCUSSION",
      createdAt: "2026-04-23T15:00:00.000Z",
    });

    const result = await postTaskComment(taskUrl, taskId, {
      message: "Updated authorized consenters and billing zip code.",
    });

    expect(api.post).toHaveBeenCalledWith(
      "https://task.test/v1/client-configurations/tasks/O-00317/comments",
      { message: "Updated authorized consenters and billing zip code." },
    );
    expect(result?.commentId).toBe("2");
  });
});
