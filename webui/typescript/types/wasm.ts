import { SimulationResult, SimulationResults } from "./election";
import { XY } from "./position";

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

/** In rust this would be:
 *
 * ```rs
 * type WasmResult = Result<Inner, Error>;
 *
 * struct Inner {
 *     real_time_progress_bar: bool,
 *     ans: Answer
 * }
 *
 * enum Answer {
 *     Answer(SimulationResults),
 *     SingleAnswer(SimulationResult, usize)
 * }
 * ```
 *
 * answer means it is ran in batch, single_answer means it is ran one by one
 * error means the simulation reached an error
 *
 * Note that running in batch or one by one, does not necessarily determine
 * whether progress bar should be updated, because voter scatter will always
 * run one by one
 * */
export type WasmResult = {
  // whether to update the progress bar
  real_time_progress_bar: boolean | null,

  // result if ran in batch
  answer: SimulationResults | null,

  // newest result if ran one by one, and the simulation number for this result
  single_answer: SimulationResult | null,
  counter: number | null,

  // error if thrown by wasm
  error: Error | null
}
