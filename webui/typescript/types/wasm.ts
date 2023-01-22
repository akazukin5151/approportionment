import { SimulationResult, SimulationResults, XY } from "./core";

export type WasmParty = XY & {
  name: string | null,
  color: string | null,
};

export type WasmRunArgs = {
  parties: Array<WasmParty>,
  method: string,
  n_seats: number,
  n_voters: number,
  stdev: number,
  real_time_progress_bar: boolean,
  use_voters_sample: boolean
};

export type WasmResult = {
  // if real_time_progress_bar is off
  answer: SimulationResults | null,
  // if real_time_progress_bar is on
  single_answer: SimulationResult | null,
  counter: number | null,
  // stores errors
  error: Error | null
}
