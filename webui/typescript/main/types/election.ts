import { XY } from "./position";

export type SimulationResults = Array<SimulationResult>;

/** A point representing a simulation result with the voter mean at x and y.
 * x and y are necessarily grid coordinates.
 * seats_by_party has a len of 200 * 200 (the domain and range of the graph).
 */
export type SimulationResult = XY & {
  seats_by_party: Array<number>,
  voters_sample: Array<XY> | null
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


