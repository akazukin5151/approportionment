import { TAU } from "./constants";
import { GridCoords } from "./types/position";

export function rad_to_deg(radians: number): number {
  return radians / TAU * 360
}

/** Fixes the atan function for quadrants. atan2 doesn't work correctly either.
 * Returns angles in radians */
export function angle_of_point(p: GridCoords): number {
  let angle = Math.atan(p.grid_y / p.grid_x)
  // quadrant 2, degrees 90 to 180
  if (p.grid_x < 0 && p.grid_y >= 0) {
    angle += Math.PI
  } else if (p.grid_x < 0 && p.grid_y < 0) {
    // quadrant 3, degrees 180 to 270
    angle += Math.PI
  } else if (p.grid_x > 0 && p.grid_y < 0) {
    // quadrant 4, degrees 270 to 360
    angle += TAU
  }
  return angle
}
