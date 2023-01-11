import { PartyPlotBoundary } from "./boundary";

export type PercentageCoord = { x: number; y: number; }

export type Message = {
  parties: Array<Party>,
  method: string,
  n_seats: number,
  n_voters: number,
};

export type WorkerMessage = {
  answer: Simulation | null,
  error: string | null
}

/** seats_by_party has a len of 200 * 200 (the domain and range of the graph) */
export type Simulation = Array<{
  voter_mean: { x: number, y: number },
  seats_by_party: Array<number>
}>;

export type Point = {
  x: number,
  y: number,
  color: string,
  seats_by_party: Array<number>
};

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

export type Rgb = {
  r: number;
  g: number;
  b: number;
};

export type PartyPlotInfo = {
  boundaries: PartyPlotBoundary,
  color: Rgb,
  num: number
}

