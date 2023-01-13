export type WasmParty = {
  x: number,
  y: number,
  name: string | null,
  color: string | null,
};

export type WasmRunArgs = {
  parties: Array<WasmParty>,
  method: string,
  n_seats: number,
  n_voters: number,
  real_time_progress_bar: boolean,
};

export type WasmResult = {
  answer: SimulationResult | null,
  single_answer: SimulationResultInner | null,
  counter: number | null,
  error: string | null
}

/** seats_by_party has a len of 200 * 200 (the domain and range of the graph) */
export type SimulationResult = Array<SimulationResultInner>;

export type SimulationResultInner = {
  voter_mean: { x: number, y: number },
  seats_by_party: Array<number>
}

/** A point representing a simulation result with the voter mean at x and y
 * x and y are necessarily grid coordinates
 */
export type SimulationPoint = {
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
