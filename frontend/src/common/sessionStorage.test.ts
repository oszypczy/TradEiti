import { describe, expect, it } from "vitest";
import {
  clearSessionStorage,
  getJsonFromSessionStorage,
  getMultipleValuesFromSessionStorage,
  removeMultipleValuesFromSessionStorage,
  saveInSessionStorage,
} from "./sessionStorage";

describe("sessionStorage helpers", () => {
  it("parses stored JSON and tolerates missing or broken values", () => {
    saveInSessionStorage("course", JSON.stringify({ course_id: "X" }));
    saveInSessionStorage("broken", "{not json");
    expect(getJsonFromSessionStorage<{ course_id: string }>("course")?.course_id).toBe("X");
    expect(getJsonFromSessionStorage("missing")).toBeUndefined();
    expect(getJsonFromSessionStorage("broken")).toBeUndefined();
  });

  it("reads multiple values with empty string defaults", () => {
    saveInSessionStorage("a", JSON.stringify(1));
    expect(getMultipleValuesFromSessionStorage(["a", "b"])).toEqual({ a: 1, b: "" });
  });

  it("removes selected keys and clears everything", () => {
    saveInSessionStorage("a", "1");
    saveInSessionStorage("b", "2");
    saveInSessionStorage("c", "3");
    removeMultipleValuesFromSessionStorage(["a", "b"]);
    expect(sessionStorage.length).toBe(1);
    clearSessionStorage();
    expect(sessionStorage.length).toBe(0);
  });
});
