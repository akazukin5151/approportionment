import * as d3 from "d3-color"
import { GridCoords } from "./xy";

/** seats_by_party has a len of 200 * 200 (the domain and range of the graph) */
export type SimulationResults = Array<SimulationResult>;

/** A point representing a simulation result with the voter mean at x and y
 * x and y are necessarily grid coordinates
 */
export type SimulationResult = XY & {
  seats_by_party: Array<number>,
  voters_sample: Array<XY> | null
}

export type XY = {
  x: number,
  y: number,
}

/**
 * the percentage fields refers to percentages of the canvas from 0 to 1
 * top to bottom, left to right
 *
 * the grid fields refers to the numbers from -1 to 1
 * bottom to top, left to right
 */
export type Party = {
  x_pct: number,
  y_pct: number,
  grid_x: number,
  grid_y: number
  color: string,
  num: number
};

/** Rgb colors from 0 to 255 inclusive **/
export type Rgb = {
  r: number;
  g: number;
  b: number;
};

export type Canvas = {
  ctx: CanvasRenderingContext2D,
  elem: HTMLCanvasElement
}

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

