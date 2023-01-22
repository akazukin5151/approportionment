import { SimulationResult, SimulationResults } from "./core";

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
  // if real_time_progress_bar is off
  answer: SimulationResults | null,
  // if real_time_progress_bar is on
  single_answer: SimulationResult | null,
  counter: number | null,
  // stores errors
  error: Error | null
}
