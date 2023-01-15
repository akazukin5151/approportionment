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
 * TODO: currently the Radviz algorithm places parties in the circle ordered
 * by their party number; their 'party color' on the Radviz plot is decided
 * this way. This will not match the actual party color assigned in the table
 *
 * TODO: need a legend to visualize the colors that parties were assigned to
 * also should work for all other colormaps too
 *
 * It's not ideal to use the party colors assigned in the table, because
 * that might result in colors being too close together. The Radviz algorithm
 * intentionally places the parties as far as possible from each other so that
 * parties can are easily distinguishable in the plot
 *
 * [1] https://ieeexplore.ieee.org/abstract/document/8302605
 * [2] https://www.scikit-yb.org/en/latest/api/features/radviz.html
 */

import * as d3 from "d3-color"
import { Rgb } from "./types"

type Radviz = {
  // these are the xy coordinates within the circle,
  // encoding the seats for all parties for this point
  seat_xs: Array<number>
  seat_ys: Array<number>
  // these are the xy coordinates of the parties on the circumference of the circle
  party_xs: Array<number>
  party_ys: Array<number>
}

/** Transform seats by parties in all points to radial points on the
 * LCh color wheel using the Radviz algorithm
 * **/
function transform_to_radial(all_seats_by_party: Array<Array<number>>): Radviz {
  // in other words this is n_parties
  const ncols = all_seats_by_party[0]!.length

  let party_xs: Array<number> = []
  let party_ys: Array<number> = []
  for (let i = 0; i < ncols; i++) {
    const t = 2 * Math.PI * (i / ncols)
    party_xs.push(Math.cos(t))
    party_ys.push(Math.sin(t))
  }

  let seat_xs: Array<number> = []
  let seat_ys: Array<number> = []
  normalize(all_seats_by_party).map(row => {
    // (s * row_)
    // this zip ups the rows and multiplies each row value with each corresponding
    // s_x value. then another array with the s_y values
    let mult_x = []
    let mult_y = []
    for (let j = 0; j < row.length; j++) {
      const v = row[j]!
      const a = party_xs[j]!
      const b = party_ys[j]!
      mult_x.push(v * a)
      mult_y.push(v * b)
    }

    // sum(axis=0) reduces mult_x and mult_y into 1 value
    const sum_x = mult_x.reduce((acc, x) => acc + x)
    const sum_y = mult_y.reduce((acc, y) => acc + y)

    // / row.sum()
    // this divide each by the row sum
    const row_sum = row.reduce((acc, x) => acc + x)
    // these two corresponds to the `xy` variable in python
    const xy_x = sum_x / row_sum
    const xy_y = sum_y / row_sum

    seat_xs.push(xy_x)
    seat_ys.push(xy_y)
  })
  return {
    seat_xs, seat_ys,
    party_xs, party_ys
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

function map_to_color(
  seat_xs: Array<number>,
  seat_ys: Array<number>
): Array<Rgb> {
  const l = 55
  let colors = []
  for (let i = 0; i < seat_xs.length; i++) {
    const p = { x: seat_xs[i]!, y: seat_ys[i]! }

    // d3 needs degrees
    // 2pi radians = 360 degrees
    // 1 radian = 360/2pi degrees
    let h = Math.atan(p.y / p.x) * (360 / (2 * Math.PI));
    // quadrant 2, degrees 90 to 180
    if (p.x < 0 && p.y > 0) {
      h += 180
    } else if (p.x < 0 && p.y < 0) {
      // quadrant 3, degrees 180 to 270
      h += 180
    } else if (p.x > 0 && p.y < 0) {
      // quadrant 4, degrees 270 to 360
      h += 360
    }

    // the points are bounded by the radius of the unit circle (1)
    // but d3 needs [0, 230]
    // https://css.land/lch/ uses 132 as max
    // by experimentation 70 matches the paper the best
    const c = Math.sqrt(p.x ** 2 + p.y ** 2) * 70;

    const color = d3.hcl(h, c, l);
    colors.push(color.rgb().clamp())
  }
  // d3's RGBColor is fully compatible with our Rgb type
  return colors
}

/** Recalculate the colors of each point using the Colormap ND algorithm **/
export function calculate_colormap_nd_color(
  all_seats_by_party: Array<Array<number>>
): Array<Rgb> {
  const r = transform_to_radial(all_seats_by_party)
  return map_to_color(r.seat_xs, r.seat_ys)
}

/** Returns the colors of each party in the order of their party num **/
export function colormap_nd_legend({party_xs, party_ys}: Radviz): Array<Rgb> {
  return map_to_color(party_xs, party_ys)
}

