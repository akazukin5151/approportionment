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
 * LCh color wheel using the Radviz algorithm
 * **/
export function transform_to_radial(
  all_seats_by_party: Array<Array<number>>
): Radviz {
  // in other words this is n_parties
  const ncols = all_seats_by_party[0]!.length

  let party_coords: Array<GridCoords> = []
  for (let i = 0; i < ncols; i++) {
    const t = 2 * Math.PI * (i / ncols)
    party_coords.push({ grid_x: Math.cos(t), grid_y: Math.sin(t) })
  }

  const seat_coords = normalize(all_seats_by_party).map(row => {
    // zip up the rows and multiplies each row value with each corresponding
    // s_x value. then another array with the s_y values
    let mult_x = []
    let mult_y = []
    for (let j = 0; j < row.length; j++) {
      const v = row[j]!
      const a = party_coords[j]!.grid_x
      const b = party_coords[j]!.grid_y
      mult_x.push(v * a)
      mult_y.push(v * b)
    }

    const sum_x = array_sum(mult_x)
    const sum_y = array_sum(mult_y)

    // this divide each by the row sum
    const row_sum = array_sum(row)
    const grid_x = sum_x / row_sum
    const grid_y = sum_y / row_sum

    return { grid_x, grid_y }
  })
  return {
    seat_coords,
    party_coords,
  }
}

// normalize a matrix into [0, 1] by column
function normalize(X: Array<Array<number>>): Array<Array<number>> {
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
  let colors = []
  for (let i = 0; i < seats.length; i++) {
    const p = seats[i]!

    // d3 needs degrees
    // 2pi radians = 360 degrees
    // 1 radian = 360/2pi degrees
    let h = Math.atan(p.grid_y / p.grid_x) * (360 / (2 * Math.PI));
    // quadrant 2, degrees 90 to 180
    if (p.grid_x < 0 && p.grid_y > 0) {
      h += 180
    } else if (p.grid_x < 0 && p.grid_y < 0) {
      // quadrant 3, degrees 180 to 270
      h += 180
    } else if (p.grid_x > 0 && p.grid_y < 0) {
      // quadrant 4, degrees 270 to 360
      h += 360
    }

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

