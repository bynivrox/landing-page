import { describe, expect, it } from "vitest";
import { box, plate, project } from "./iso";

describe("isometric projection", () => {
  it("projects the axes at 30 degrees, with z straight up", () => {
    expect(project([0, 0, 0])).toEqual([0, 0]);
    expect(project([100, 0, 0])).toEqual([86.6, 50]);
    expect(project([0, 100, 0])).toEqual([-86.6, 50]);
    expect(project([0, 0, 40])).toEqual([0, -40]);
  });

  it("draws a plate as a closed diamond", () => {
    expect(plate(0, 0, 0, 100, 100)).toBe("M 0 0 L 86.6 50 L 0 100 L -86.6 50 Z");
  });

  it("gives a box its top above its sides", () => {
    const faces = box(0, 0, 0, 100, 100, 20);
    expect(faces.top).toBe("M 0 -20 L 86.6 30 L 0 80 L -86.6 30 Z");
    expect(faces.left.startsWith("M -86.6 50")).toBe(true);
    expect(faces.right.startsWith("M 86.6 50")).toBe(true);
  });
});
