import { describe, it, expect, vi } from "vitest";

vi.mock("@ucc/common-ui", () => ({
  hasPermission: (all: string[], permission: string) => all.includes(permission),
}));

import { USER_ROLES } from "@/utils";
import type { UserKey } from "@/types/user";
import type { ConfiguratorTask } from "../ConfiguratorDashboard";
import { visibleRowActions, RowActionKey } from "../rowActions";

const USER = "Alice";
const OTHER = "Bob";

const task = (overrides: Partial<ConfiguratorTask> = {}) =>
  ({ taskId: "O-001", taskMongoId: "m-001", status: ["DRAFT"], createdBy: OTHER, ...overrides } as ConfiguratorTask);

const keysFor = (
  role: UserKey,
  row: ConfiguratorTask,
  permissions: string[] = ["task:assign"],
  userName = USER,
): RowActionKey[] => visibleRowActions({ row, role, userName, permissions }).map((a) => a.key);

const VIEW_ONLY: RowActionKey[] = ["view_details", "view_work_log"];

describe("visibleRowActions", () => {
  it("gives an unrecognised role no actions", () => {
    expect(keysFor("NOT_A_ROLE" as UserKey, task())).toEqual([]);
  });

  it.each([USER_ROLES.QUALITY_REVIEWER, USER_ROLES.VIEWER, USER_ROLES.REQUESTER])(
    "%s is view-only",
    (role) => {
      expect(keysFor(role, task({ status: ["PENDING_QUALITY_REVIEW"] }))).toEqual(VIEW_ONLY);
    },
  );

  describe("terminal statuses", () => {
    // The bug this refactor fixes: ADMINISTRATOR used to get hold/cancel on terminal rows.
    it.each([
      [USER_ROLES.ADMINISTRATOR, "COMPLETED"],
      [USER_ROLES.ADMINISTRATOR, "CANCELLED"],
      [USER_ROLES.CONFIGURATOR, "COMPLETED"],
      [USER_ROLES.CONFIGURATOR_MANAGER, "COMPLETED"],
      [USER_ROLES.QUALITY_MANAGER, "CANCELLED"],
    ])("%s gets no hold/cancel on a %s row", (role, status) => {
      expect(keysFor(role as UserKey, task({ status: [status] }))).toEqual(VIEW_ONLY);
    });
  });

  describe("hold actions are mutually exclusive", () => {
    it("offers remove_hold (not put_on_hold) when ON_HOLD", () => {
      const keys = keysFor(USER_ROLES.CONFIGURATOR, task({ status: ["ON_HOLD"] }));
      expect(keys).toContain("remove_hold");
      expect(keys).not.toContain("put_on_hold");
    });

    it("offers put_on_hold (not remove_hold) when not ON_HOLD", () => {
      const keys = keysFor(USER_ROLES.CONFIGURATOR, task({ status: ["DRAFT"] }));
      expect(keys).toContain("put_on_hold");
      expect(keys).not.toContain("remove_hold");
    });
  });

  describe("schedule_for_production", () => {
    it("requires APPROVED status", () => {
      expect(keysFor(USER_ROLES.CONFIGURATOR_MANAGER, task({ status: ["DRAFT"] })))
        .not.toContain("schedule_for_production");
    });

    it("is offered to a CONFIGURATOR only for a task they created", () => {
      const approvedOwn = task({ status: ["APPROVED"], createdBy: USER });
      const approvedOther = task({ status: ["APPROVED"], createdBy: OTHER });
      expect(keysFor(USER_ROLES.CONFIGURATOR, approvedOwn)).toContain("schedule_for_production");
      expect(keysFor(USER_ROLES.CONFIGURATOR, approvedOther)).not.toContain("schedule_for_production");
    });

    it("ignores ownership for managers and admins", () => {
      const row = task({ status: ["APPROVED"], createdBy: OTHER });
      expect(keysFor(USER_ROLES.CONFIGURATOR_MANAGER, row)).toContain("schedule_for_production");
      expect(keysFor(USER_ROLES.ADMINISTRATOR, row)).toContain("schedule_for_production");
    });

    it("is never offered to a QUALITY_MANAGER", () => {
      expect(keysFor(USER_ROLES.QUALITY_MANAGER, task({ status: ["APPROVED"] })))
        .not.toContain("schedule_for_production");
    });
  });

  describe("assign_task", () => {
    const assignable = task({ status: ["PENDING_PEER_REVIEW"], createdBy: OTHER });

    it("is offered on an assignable status with the task:assign permission", () => {
      expect(keysFor(USER_ROLES.CONFIGURATOR_MANAGER, assignable)).toContain("assign_task");
    });

    it("is withheld without the task:assign permission", () => {
      expect(keysFor(USER_ROLES.CONFIGURATOR_MANAGER, assignable, [])).not.toContain("assign_task");
    });

    it("is withheld on a non-assignable status", () => {
      expect(keysFor(USER_ROLES.CONFIGURATOR_MANAGER, task({ status: ["DRAFT"] })))
        .not.toContain("assign_task");
    });

    it("is withheld for a task the user created themselves", () => {
      const own = task({ status: ["PENDING_PEER_REVIEW"], createdBy: USER });
      expect(keysFor(USER_ROLES.CONFIGURATOR_MANAGER, own)).not.toContain("assign_task");
    });

    it("is never offered to a CONFIGURATOR", () => {
      expect(keysFor(USER_ROLES.CONFIGURATOR, assignable)).not.toContain("assign_task");
    });
  });

  it("returns actions in registry order", () => {
    const row = task({ status: ["APPROVED"], createdBy: OTHER });
    expect(keysFor(USER_ROLES.ADMINISTRATOR, row)).toEqual([
      "view_details",
      "view_work_log",
      "schedule_for_production",
      "put_on_hold",
      "cancel_task",
    ]);
  });

  it("tolerates a row with no status array", () => {
    expect(keysFor(USER_ROLES.ADMINISTRATOR, { taskId: "x" } as ConfiguratorTask))
      .toEqual(["view_details", "view_work_log", "put_on_hold", "cancel_task"]);
  });

  describe("revert_to_draft", () => {
    const canRevert = (
      role: UserKey,
      status: string,
      assignee?: string,
    ): boolean =>
      keysFor(role, task({ status: [status], assignee } as Partial<ConfiguratorTask>))
        .includes("revert_to_draft");

    describe("roles", () => {
      it.each([USER_ROLES.CONFIGURATOR, USER_ROLES.CONFIGURATOR_MANAGER])(
        "is offered to %s",
        (role) => {
          expect(canRevert(role, "APPROVED")).toBe(true);
        },
      );

      it.each([
        USER_ROLES.ADMINISTRATOR,
        USER_ROLES.QUALITY_MANAGER,
        USER_ROLES.QUALITY_REVIEWER,
        USER_ROLES.VIEWER,
        USER_ROLES.REQUESTER,
      ])("is withheld from %s", (role) => {
        expect(canRevert(role, "APPROVED")).toBe(false);
      });
    });

    describe("statuses without an assignee condition", () => {
      it.each(["APPROVED", "SCHEDULED"])("is offered on %s", (status) => {
        expect(canRevert(USER_ROLES.CONFIGURATOR, status)).toBe(true);
      });

      it.each([
        "DRAFT",
        "PEER_REVIEW_IN_PROGRESS",
        "QUALITY_REVIEW_IN_PROGRESS",
        "REJECTED_PEER_REVIEW",
        "REJECTED_QUALITY_REVIEW",
        "PENDING_REBUTTAL_REVIEW",
        "REBUTTAL_IN_PROGRESS",
        "ON_HOLD",
        "CANCELLED",
        "COMPLETED",
      ])("is withheld on %s", (status) => {
        expect(canRevert(USER_ROLES.CONFIGURATOR, status)).toBe(false);
      });
    });

    describe("PENDING_PEER_REVIEW requires the Configurator Manager assignee", () => {
      it("is offered when the assignee matches", () => {
        expect(
          canRevert(USER_ROLES.CONFIGURATOR, "PENDING_PEER_REVIEW", "Configurator Manager"),
        ).toBe(true);
      });

      it.each([
        "Quality Reviewer Manager",
        "Alice",
        "",
        undefined,
      ])("is withheld when the assignee is %p", (assignee) => {
        expect(
          canRevert(USER_ROLES.CONFIGURATOR, "PENDING_PEER_REVIEW", assignee),
        ).toBe(false);
      });
    });

    describe("PENDING_QUALITY_REVIEW requires the Quality Reviewer Manager assignee", () => {
      it("is offered when the assignee matches", () => {
        expect(
          canRevert(
            USER_ROLES.CONFIGURATOR,
            "PENDING_QUALITY_REVIEW",
            "Quality Reviewer Manager",
          ),
        ).toBe(true);
      });

      it.each(["Configurator Manager", "Bob", "", undefined])(
        "is withheld when the assignee is %p",
        (assignee) => {
          expect(
            canRevert(USER_ROLES.CONFIGURATOR, "PENDING_QUALITY_REVIEW", assignee),
          ).toBe(false);
        },
      );
    });

    it("matches the assignee irrespective of case and separator", () => {
      for (const assignee of [
        "configurator manager",
        "CONFIGURATOR_MANAGER",
        "  Configurator   Manager  ",
      ]) {
        expect(
          canRevert(USER_ROLES.CONFIGURATOR, "PENDING_PEER_REVIEW", assignee),
        ).toBe(true);
      }
    });
  });
});
