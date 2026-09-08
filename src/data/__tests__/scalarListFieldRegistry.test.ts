import { describe, expect, it } from "vitest";
import {
  SCALAR_LIST_FIELD_REGISTRY,
  formatScalarListChange,
  getScalarListValues,
  isScalarListChange,
  isWholeListChange,
} from "../scalarListFieldRegistry";

describe("scalarListFieldRegistry", () => {
  it("detects added/removed-only list diffs", () => {
    expect(
      isScalarListChange({
        added: ["mahesh yadav"],
        removed: ["Emaly Rodriguez"],
        modified: [],
      }),
    ).toBe(true);
  });

  it("rejects entity-array diffs with modified items", () => {
    expect(
      isScalarListChange({
        added: [],
        removed: [],
        modified: [{ id: ["REL-1"], changes: {} }],
      }),
    ).toBe(false);
  });

  it("maps removed to previous and added to updated values", () => {
    expect(
      formatScalarListChange({
        added: ["mahesh yadav"],
        removed: ["Emaly Rodriguez", "Heather Greenwell"],
        modified: [],
      }),
    ).toEqual({
      previousValue: "Emaly Rodriguez\nHeather Greenwell",
      updatedValue: "mahesh yadav",
    });
  });

  describe("oldValue/newValue whole-list shape", () => {
    const WHOLE_LIST = {
      oldValue: ["Bharat kumar", "Carol Jenny", "John Wick", "Vinod Gandham"],
      newValue: ["Carol Jenny", "John Wick", "Vinod Gandham", "Aptos Narrow (Body)"],
    };

    it("is recognised as a list change", () => {
      expect(isWholeListChange(WHOLE_LIST)).toBe(true);
      expect(isScalarListChange(WHOLE_LIST)).toBe(true);
    });

    it("maps oldValue to previous and newValue to updated values", () => {
      expect(formatScalarListChange(WHOLE_LIST)).toEqual({
        previousValue: "Bharat kumar\nCarol Jenny\nJohn Wick\nVinod Gandham",
        updatedValue: "Carol Jenny\nJohn Wick\nVinod Gandham\nAptos Narrow (Body)",
      });
    });

    it("returns the raw lists for seeding editable fields", () => {
      expect(getScalarListValues(WHOLE_LIST)).toEqual({
        previous: WHOLE_LIST.oldValue,
        updated: WHOLE_LIST.newValue,
      });
    });

    it("still prefers added/removed when no whole-list values are present", () => {
      expect(isWholeListChange({ added: ["a"], removed: ["b"] })).toBe(false);
      expect(getScalarListValues({ added: ["a"], removed: ["b"] })).toEqual({
        previous: ["b"],
        updated: ["a"],
      });
    });

    it("tolerates a one-sided or emptied list", () => {
      expect(formatScalarListChange({ oldValue: [], newValue: ["only"] })).toEqual({
        previousValue: "—",
        updatedValue: "only",
      });
      expect(formatScalarListChange({ newValue: ["added only"] })).toEqual({
        previousValue: "—",
        updatedValue: "added only",
      });
    });

    it("ignores non-array oldValue/newValue so plain scalars are untouched", () => {
      expect(isScalarListChange({ oldValue: "Yes", newValue: "No" })).toBe(false);
    });
  });

  it("registers org and group marketing site user telemed paths", () => {
    expect(
      SCALAR_LIST_FIELD_REGISTRY[
        "organizationMarketing.details.contacts.marketingSiteUserTelemed"
      ]?.label,
    ).toBe("Marketing site user - Telemed");
    expect(
      SCALAR_LIST_FIELD_REGISTRY[
        "groupMarketing.overview.contacts.marketingSiteUserTelemed"
      ]?.tabName,
    ).toBe("Overview");
  });
});
