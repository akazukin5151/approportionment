import { SimulationResult, SimulationResults } from "./election";
import { XY } from "./position";

export type RngArgs = {
  // only used for generating random normal, if present then it will
  // generate the random number, otherwise it will run a simulation
  // using the above settings
  mean_x: number | null,
  mean_y: number | null,
  stdev: number,
  // this is not used for generation, just to make it easier to track
  // which party this candidate belongs to
  coalition_num: string | null
}

export type WasmRunArgs = {
  parties: Array<XY>,
  method: string,
  n_seats: number,
  n_voters: number,
  stdev: number,
  real_time_progress_bar: boolean,
  use_voters_sample: boolean,
} & RngArgs;

/** In rust this would be:
 *
 * ```rs
 * type WasmResult = Result<Inner, Error>;
 *
 * enum Inner {
 *     RandNum((usize, String)),
 *     Simulation(Simulation)
 * }
 *
 * struct Simulation {
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
  // the random point (candidate) that was generated
  point: XY | null,
  // the party that the candidate belongs to
  coalition_num: string | null,

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
