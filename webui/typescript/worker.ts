import init, {
  simulate_elections, simulate_single_election
} from "libapproportionment";
import { WasmRunArgs, WasmResult } from './types/wasm';

function main(evt: MessageEvent<WasmRunArgs>): void {
  init().then(() => {
    if (evt.data.real_time_progress_bar) {
      run_with_progress(evt.data)
    } else {
      run_without_progress(evt.data)
    }
  });
}

function run_with_progress(
  { method, n_seats, n_voters, parties, use_voters_sample }: WasmRunArgs,
): void {
  let counter = 1
  for (let y = 100; y > -100; y--) {
    for (let x = -100; x < 100; x++) {
      run_and_catch_err(() => ({
        single_answer: simulate_single_election(
          method, n_seats, n_voters, parties, x / 100, y / 100, use_voters_sample
        ),
        counter,
        error: null,
        answer: null,
      }))
      counter += 1
    }
  }
}

function run_without_progress(
  { method, n_seats, n_voters, parties, use_voters_sample }: WasmRunArgs
): void {
  run_and_catch_err(() => ({
    answer: simulate_elections(method, n_seats, n_voters, parties, use_voters_sample),
    error: null,
    single_answer: null,
    counter: null
  }))
}

function run_and_catch_err(func: () => WasmResult): void {
  try {
    self.postMessage(func())
  } catch (e) {
    const msg: WasmResult = {
      error: e as Error,
      single_answer: null, counter: null, answer: null
    }
    self.postMessage(msg)
  }
}

self.onmessage = main
