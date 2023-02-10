import { TAU } from "./constants";

export function rad_to_deg(radians: number): number {
  return radians / TAU * 360
}
