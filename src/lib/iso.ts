/**
 * Isometric projection for the page's illustrations (pure geometry, no DOM). World x runs to the lower right, y to
 * the lower left and z up; a unit is one screen pixel along the axis before projection.
 */

const cos30 = Math.cos(Math.PI / 6);

export type Point3 = readonly [x: number, y: number, z: number];

export function project([x, y, z]: Point3): [number, number] {
  return [round((x - y) * cos30), round((x + y) / 2 - z)];
}

/** A closed polygon through world points. */
export function polygon(points: readonly Point3[]): string {
  return `${points.map((point, index) => `${index === 0 ? "M" : "L"} ${project(point).join(" ")}`).join(" ")} Z`;
}

/** An open path through world points. */
export function polyline(points: readonly Point3[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${project(point).join(" ")}`).join(" ");
}

/** A flat rectangle (outline) lying at height z. */
export function plate(x: number, y: number, z: number, width: number, depth: number): string {
  return polygon([
    [x, y, z],
    [x + width, y, z],
    [x + width, y + depth, z],
    [x, y + depth, z],
  ]);
}

/** The three visible faces of a box: top, the front-left side (at y + depth) and the front-right side (at x + width). */
export function box(x: number, y: number, z: number, width: number, depth: number, height: number) {
  const top = z + height;
  return {
    top: plate(x, y, top, width, depth),
    left: polygon([
      [x, y + depth, z],
      [x + width, y + depth, z],
      [x + width, y + depth, top],
      [x, y + depth, top],
    ]),
    right: polygon([
      [x + width, y, z],
      [x + width, y + depth, z],
      [x + width, y + depth, top],
      [x + width, y, top],
    ]),
  };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
