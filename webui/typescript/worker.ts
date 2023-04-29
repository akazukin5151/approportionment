import init, {
  generate_normal,
  set_data,
  simulate_elections,
  simulate_single_election
} from "libapproportionment";
import { WasmRunArgs, WasmResult } from './types/wasm';

// If voters scatter is enabled, but the simulations are batch-ran,
// the browser freezes.
// This does not happen if simulations are ran one by one instead of
// all in one in batch, so the reason is probably because of deserializing
// a massive struct from wasm to JS.
//
// Therefore, if voters scatter is enabled, simulations will always be
// ran one-by-one, no matter what the setting for real_time_progress_bar is.
// real_time_progress_bar would only determine whether the progress bar is updated
// or not.
//
// If voters scatter is disabled, simulations will be ran one-by-one if
// real_time_progress_bar is on, and in batch otherwise.

function main(evt: MessageEvent<WasmRunArgs>): void {
  init().then(() => {
    if (evt.data.mean_x !== null && evt.data.mean_y !== null) {
      const point =
        generate_normal(evt.data.mean_x, evt.data.mean_y, evt.data.stdev)
      return self.postMessage({ point, coalition_num: evt.data.coalition_num })
    }

    const one_by_one = evt.data.use_voters_sample
      ? true
      : evt.data.real_time_progress_bar
    if (one_by_one) {
      run_one_by_one(evt.data)
    } else {
      run_in_batch(evt.data)
    }
  });
}

function run_one_by_one(
  { method,
    n_seats,
    n_voters,
    parties,
    stdev,
    real_time_progress_bar,
    use_voters_sample,
    seed }: WasmRunArgs,
): void {
  set_data(
    seed,
    method,
    n_seats,
    n_voters,
    stdev,
    use_voters_sample
  )
  let counter = 1
  for (let y = 100; y > -100; y--) {
    for (let x = -100; x < 100; x++) {
      run_and_catch_err(() => ({
        real_time_progress_bar,
        single_answer: simulate_single_election(parties, x / 100, y / 100),
        counter,
        error: null, answer: null, point: null, coalition_num: null
      }))
      counter += 1
    }
  }
}

function run_in_batch(
  { method,
    n_seats,
    n_voters,
    parties,
    stdev,
    real_time_progress_bar,
    use_voters_sample,
    seed }: WasmRunArgs,
): void {
  run_and_catch_err(() => ({
    real_time_progress_bar,
    answer: simulate_elections(
      method, n_seats, n_voters, stdev, parties, use_voters_sample, seed
    ),
    error: null, single_answer: null, counter: null, point: null, coalition_num: null
  }))
}

function run_and_catch_err(func: () => WasmResult): void {
  try {
    self.postMessage(func())
  } catch (e) {
    const msg: WasmResult = {
      error: e as Error,
      single_answer: null, counter: null, answer: null,
      real_time_progress_bar: null, point: null, coalition_num: null
    }
    self.postMessage(msg)
  }
}

self.onmessage = main
