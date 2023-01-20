/** A collection of functions for matrix-like calculations **/

import { array_sum, max_by_col, min_by_col } from "../std_lib";
import { GridCoords } from "../types";

/**
 * For every party's number of seats in `seats_by_party`, multiply it with
 * that party's location on the circumference.
 * This would scale the points towards the party's direction proportional
 * to their performance, the more seats the closer the point will be to the
 * circumference */
export function scale_seats_to_party_coords(
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
export function sum_to_election_result(
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
export function normalize_election_result(
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
export function normalize_by_party(X: Array<Array<number>>): Array<Array<number>> {
  const mins = min_by_col(X)
  const maxs = max_by_col(X)

  // for every column, subtract the value in every row by that column's min
  const top = X.map(row =>
    row.map((value, i) => value - mins[i]!)
  )

  // subtract the matching max and mins of each row
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

