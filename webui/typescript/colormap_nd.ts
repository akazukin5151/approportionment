/**
 * A color blending algorithm based on the Colormap ND paper [1]
 *
 * Its goal is to map multi-dimensional data into CIE LCh color space
 *
 * First, it uses the Radviz algorithm [2], which places every dimension
 * on the circumference of a circle, initially equally spaced from each other.
 *
 * The data points are plotted according to its value in each dimension,
 * each point within the circle
 *
 * The CIE LCh color space at luminosity=55 is superimposed on the circle
 * All data points would correspond to a color
 *
 * This code is a focused translation of [3] from Python to Typescript
 *
 * TODO: currently the Radviz algorithm places parties in the circle ordered
 * by their party number; their 'party color' on the Radviz plot is decided
 * this way. This will not match the actual party color assigned in the table
 *
 * It's not ideal to use the party colors assigned in the table, because
 * that might result in colors being too close together. The Radviz algorithm
 * intentionally places the parties as far as possible from each other so that
 * parties can are easily distinguishable in the plot
 *
 * [1] https://ieeexplore.ieee.org/abstract/document/8302605
 * [2] https://www.scikit-yb.org/en/latest/api/features/radviz.html
 * [3] https://github.com/DistrictDataLabs/yellowbrick/blob/develop/yellowbrick/features/radviz.py
 */

import * as d3 from "d3-color"
import { array_sum } from "./std_lib"
import { GridCoords, Radviz, Rgb } from "./types"

/** Transform seats by parties in all points to radial points on the
 * LCh color wheel using the Radviz algorithm */
export function transform_to_radial(
  all_seats_by_party: Array<Array<number>>
): Radviz {
  // in other words this is n_parties
  const ncols = all_seats_by_party[0]!.length

  const party_coords: Array<GridCoords> = distribute_around_circumference(ncols)

  const checkbox = document.getElementById('expand-points') as HTMLInputElement
  const should_expand_points = checkbox.checked

  const seat_coords = calculate_seat_coords(
    all_seats_by_party,
    party_coords,
    should_expand_points,
    ncols
  )

  return { seat_coords, party_coords, }
}

function calculate_seat_coords(
  all_seats_by_party: Array<Array<number>>,
  party_coords: Array<GridCoords>,
  should_expand_points: boolean,
  ncols: number
): Array<GridCoords> {
  return normalize_by_party(all_seats_by_party).map(seats_by_party => {
    const { scaled_x, scaled_y } =
      scale_seats_to_party_coords(seats_by_party, party_coords)
    const aggregated = sum_to_election_result(scaled_x, scaled_y)
    const normed = normalize_election_result(aggregated, seats_by_party)
    if (should_expand_points) {
      return expand_points(party_coords, normed, ncols)
    } else {
      return normed
    }
  })
}

/** Distribute the given number of parties around the circumference of a
 * unit circle.
 *
 * Adds an angular offset to try to avoid party points being at x=0 or y=0
 * as that essentially negates their "pull" in one direction
 * pi/12 is chosen because it is a nice round fraction of pi,
 * and it very rarely causes other points to have 0 values [0]
 *
 * strictly speaking, to minimize the chance of points having 0 values,
 * it's best to pick a completely unrelated random looking decimal, but oh well
 * even then it is still theoretically possible to have enough parties
 * to cause a 0 value
 *
 * TODO: it's fine as a default, just let people rotate it arbitrarily
 *
 * [0]: The first solution to `cos(2pi * x + pi/12) = 0` is `x = 5/24`, meaning
 * the 4th party out of 24 parties will have a x-coordinate of 0.
 * The first solution to `sin(2pi * y + pi/12) = 0` is `y = 11/24`, meaning
 * the 11th party out of 24 parties will have a y-coordinate of 0. */
function distribute_around_circumference(n_parties: number): Array<GridCoords> {
  const offset = Math.PI / 12
  const party_coords: Array<GridCoords> = []
  for (let i = 0; i < n_parties; i++) {
    const t = 2 * Math.PI * (i / n_parties)
    party_coords.push({
      grid_x: Math.cos(t + offset),
      grid_y: Math.sin(t + offset)
    })
  }
  return party_coords
}

/**
 * For every party's number of seats in `seats_by_party`, multiply it with
 * that party's location on the circumference.
 * This would scale the points towards the party's direction proportional
 * to their performance, the more seats the closer the point will be to the
 * circumference */
function scale_seats_to_party_coords(
  seats_by_party: Array<number>,
  party_coords: Array<GridCoords>
): { scaled_x: Array<number>; scaled_y: Array<number> } {
  const scaled_x = []
  const scaled_y = []
  for (let j = 0; j < seats_by_party.length; j++) {
    const v = seats_by_party[j]!
    const a = party_coords[j]!.grid_x
    const b = party_coords[j]!.grid_y
    scaled_x.push(v * a)
    scaled_y.push(v * b)
  }
  return { scaled_x, scaled_y }
}

/**
 * Each point represents the number of seats a party received in one election.
 * Summing up the points is to aggregate this election result (similar to mean)
 * to a single number that represents this election result.
 * This number contains information about every party's seats. */
function sum_to_election_result(
  mult_x: Array<number>,
  mult_y: Array<number>,
): GridCoords {
  return {
    grid_x: array_sum(mult_x),
    grid_y: array_sum(mult_y)
  }
}

/**
 * Normalizes the single number to the total number of seats.
 * The single number represents a single election result, so the result
 * represents the election result relative to all seats */
function normalize_election_result(
  sum: GridCoords,
  seats_by_party: Array<number>
): GridCoords {
  // this is the total number of seats
  const row_sum = array_sum(seats_by_party)
  return {
    grid_x: sum.grid_x / row_sum,
    grid_y: sum.grid_y / row_sum
  }
}

/** Normalize a matrix into the range [0, 1] by column */
function normalize_by_party(X: Array<Array<number>>): Array<Array<number>> {
  const mins = X.reduce((acc, row) => {
    const mins_so_far = []
    for (let i = 0; i < row.length; i++) {
      const a = acc[i]!
      const b = row[i]!
      if (b < a) {
        mins_so_far.push(b)
      } else {
        mins_so_far.push(a)
      }
    }
    return mins_so_far
  })

  const maxs = X.reduce((acc, row) => {
    const maxs_so_far = []
    for (let i = 0; i < row.length; i++) {
      const a = acc[i]!
      const b = row[i]!
      if (b > a) {
        maxs_so_far.push(b)
      } else {
        maxs_so_far.push(a)
      }
    }
    return maxs_so_far
  })

  // for every column, subtract the value in every row by that column's min
  const top = X.map(row =>
    row.map((value, i) => value - mins[i]!)
  )

  // zip b and a and subtract
  const bottom: Array<number> = []
  for (let i = 0; i < maxs.length; i++) {
    bottom.push(maxs[i]! - mins[i]!)
  }

  // top / bottom, column wise
  // for every value, divide it by the `bottom` value for its column
  return top.map(row =>
    row.map((value, i) => value / bottom[i]!)
  )
}

export function map_to_lch(seats: Array<GridCoords>): Array<Rgb> {
  const l = 55
  const colors = []
  for (const p of seats) {
    // d3 needs degrees
    // 2pi radians = 360 degrees
    // 1 radian = 360/2pi degrees
    const h = angle_of_point(p) * (360 / (2 * Math.PI))

    // the points are bounded by the radius of the unit circle (1)
    // but d3 needs [0, 230]
    // https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/lch
    // mdn uses 230 as max
    // https://css.land/lch/ uses 132 as max
    // by experimentation 70 matches the paper the best
    const c = Math.sqrt(p.grid_x ** 2 + p.grid_y ** 2) * 70;

    const color = d3.hcl(h, c, l);
    colors.push(color.rgb().clamp())
  }
  // d3's RGBColor is fully compatible with our Rgb type
  return colors
}

/** Fixes the atan function for quadrants. atan2 doesn't work correctly either.
 * Returns angles in radians
 */
function angle_of_point(p: GridCoords): number {
  let angle = Math.atan(p.grid_y / p.grid_x)
  // quadrant 2, degrees 90 to 180
  if (p.grid_x < 0 && p.grid_y > 0) {
    angle += Math.PI
  } else if (p.grid_x < 0 && p.grid_y < 0) {
    // quadrant 3, degrees 180 to 270
    angle += Math.PI
  } else if (p.grid_x > 0 && p.grid_y < 0) {
    // quadrant 4, degrees 270 to 360
    angle += Math.PI * 2
  }
  return angle
}

/* the points are bounded by a n-sided polygon where n is the number of parties
 * because each result must sum to the same number -- the total number of seats
 * this causes colors to be unused and points to have duller colors
 * so this pushes the points outside that polygon to get higher contrast
 * at the expense of no longer having the n-sided polygon as a guidance */
function expand_points(
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
