/**
 * A color blending algorithm based on the ColormapND paper [1]
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

import { TAU } from "../constants"
import { Radviz } from "../types/cache"
import { GridCoords } from "../types/position"
import { expand_point } from "./expand_point"

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

  return { seat_coords, party_coords }
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
 * [0]: The first solution to `cos(2pi * x + pi/12) = 0` is `x = 5/24`, meaning
 * the 4th party out of 24 parties will have a x-coordinate of 0.
 * The first solution to `sin(2pi * y + pi/12) = 0` is `y = 11/24`, meaning
 * the 11th party out of 24 parties will have a y-coordinate of 0. */
function distribute_around_circumference(n_parties: number): Array<GridCoords> {
  const party_coords: Array<GridCoords> = []
  for (let i = 0; i < n_parties; i++) {
    party_coords.push(map_party_to_circumference(i, n_parties, Math.PI / 12))
  }
  return party_coords
}

/** Map parties to the `n_parties`th roots of unity, shifted by `offset`. **/
export function map_party_to_circumference(
  party_num: number,
  n_parties: number,
  offset: number
): GridCoords {
  const t = TAU * (party_num / n_parties)
  return {
    grid_x: Math.cos(t + offset),
    grid_y: Math.sin(t + offset)
  }
}

// This is an inlined and imperative version for optimized performance
// There were significant performance gains according to profiling
// By replacing functional calls to map and reduce with for loops
// And merging multiple maps into a single loop
// eslint-disable-next-line max-lines-per-function
export function calculate_seat_coords(
  matrix: Array<Array<number>>,
  party_coords: Array<GridCoords>,
  should_expand_points: boolean,
  n_parties: number
): Array<GridCoords> {
  const maxs: Array<number> = []
  const mins: Array<number> = []
  const first_row = matrix[0]!
  for (let i = 0; i < n_parties; i++) {
    maxs.push(first_row[i]!)
    mins.push(first_row[i]!)
  }

  // start on the second row as the first row is already set
  for (let row_idx = 1; row_idx < matrix.length; row_idx++) {
    const row = matrix[row_idx]!
    for (let col_idx = 0; col_idx < row.length; col_idx++) {
      const max_acc = maxs[col_idx]!
      const min_acc = mins[col_idx]!

      const value = row[col_idx]!
      if (value < min_acc) {
        mins[col_idx] = value
      }
      if (value > max_acc) {
        maxs[col_idx] = value
      }
    }
  }

  const normed = []
  for (const row of matrix) {
    let row_sum = 0
    let sum_x = 0
    let sum_y = 0
    for (let i = 0; i < row.length; i++) {
      const value = row[i]!
      const normalized = (value - mins[i]!) / (maxs[i]! - mins[i]!)
      sum_x += normalized * party_coords[i]!.grid_x
      sum_y += normalized * party_coords[i]!.grid_y
      row_sum += normalized
    }

    let coords = { grid_x: sum_x / row_sum, grid_y: sum_y / row_sum }
    if (should_expand_points) {
      // this function doesn't have any loops except for a single sort,
      // otherwise it's just raw maths
      coords = expand_point(party_coords, coords, n_parties)
    }
    normed.push(coords)
  }

  return normed
}

