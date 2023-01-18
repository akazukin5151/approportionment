import { GridCoords } from "../types"
import { angle_of_point } from "./utils"

/* the points are bounded by a n-sided polygon where n is the number of parties
 * because each result must sum to the same number -- the total number of seats
 * this causes colors to be unused and points to have duller colors
 * so this pushes the points outside that polygon to get higher contrast
 * at the expense of no longer having the n-sided polygon as a guidance */
export function expand_points(
  party_coords: Array<GridCoords>,
  { grid_x, grid_y }: GridCoords,
  n_parties: number
): GridCoords {
  // OP' = OP/OA * OB
  // OP' = distance from origin to new point
  // OP = distance from origin to old point
  // OA = draw a line segment from origin through the old point to the circle
  //      OA is the length of the section from origin to polyon edge
  // OB = radius of circle (which is 1)
  const dist_to_old_point = Math.sqrt(grid_x ** 2 + grid_y ** 2)

  // for every point, find their two closest parties on the circumference
  // these two parties. When the two parties are connected with a
  // straight line, the line forms one edge of the polygon that would
  // intersect the line segment from origin to this point.
  // Once we have two lines, we have their linear equations, and can find the
  // intersection point

  const angle = angle_of_point({ grid_y, grid_x })

  // if parties are not rotated, a simple division will suffice
  // but to give flexibility, an exhaustive search is done instead
  // sorting should be fast enough if there aren't too much parties
  const sorted = party_coords
    .map(c => ({ c, a: angle_of_point(c) }))
    .sort((a, b) => a.a - b.a)
  let party2_idx = sorted.findIndex(({ a }) => a >= angle)
  if (party2_idx === -1) {
    // the point's angle is larger than any party,
    // so the starting party is the last party
    party2_idx = 0
  }
  // avoid mod of negative numbers
  const party1_idx = party2_idx === 0
    ? sorted.length - 1
    : (party2_idx - 1) % n_parties

  const party1 = sorted[party1_idx]!.c
  const party2 = sorted[party2_idx]!.c

  const m1 = (party2.grid_y - party1.grid_y) / (party2.grid_x - party1.grid_x)
  const c1 = party1.grid_y - m1 * party1.grid_x
  // y1 = m1 * x + c1
  // y2 = (grid_y / grid_x) * x
  // m1 * x + c1 = (grid_y / grid_x) * x
  // c1 = (grid_y / grid_x) * x - (m1 * x)
  // c1 = x * ((grid_y / grid_x) - m1)
  // c1 / ((grid_y / grid_x) - m1) = x
  const x_of_intersection = c1 / ((grid_y / grid_x) - m1)
  const y_of_intersection = m1 * x_of_intersection + c1
  const distance_to_intersection =
    Math.sqrt(x_of_intersection ** 2 + y_of_intersection ** 2)

  // times radius which is 1
  const dist_to_new_point = dist_to_old_point / distance_to_intersection
  // soh cah toa
  const np_x = dist_to_new_point * Math.cos(angle)
  const np_y = dist_to_new_point * Math.sin(angle)
  return { grid_x: np_x, grid_y: np_y }
}
