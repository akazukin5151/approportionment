import { Rgb } from "./core"
import { Party, SimulationResults } from "./election"
import { GridCoords } from "./position"

/** Avoid naming conflict with built in Cache type **/
export type AppCache = {
  cache: SimulationResults,
  colors: Array<Rgb>,
  parties: Array<Party>,
  legend: Legend
}

export type ColorsAndLegend = Pick<AppCache, 'colors' | 'legend'>

export type Legend = {
  quantity: 'Party' | 'Seats',
  // Code for quantity === 'Party' uses the formatRgb() method in d3.RGBColor
  // This won't affect code for quantity === 'Seats', because it only
  // uses the r, g, b properties, which is fully compatible
  colors: Array<Rgb> | Array<d3.RGBColor>,
  radviz: Radviz | null
}

export type Radviz = {
  // these are the coordinates within the unit circle,
  // which encodes the number of seats for all parties for this point
  seat_coords: Array<GridCoords>
  // these are the coordinates of the parties on the circumference of the circle
  party_coords: Array<GridCoords>
}

