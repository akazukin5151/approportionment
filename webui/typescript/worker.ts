import init, { simulate_elections, simulate_single_election } from "libapproportionment";
import { SimulationResults, SimulationResult, WasmRunArgs } from './types';

function main(evt: MessageEvent<WasmRunArgs>): void {
  init().then(() => {
    if (evt.data.real_time_progress_bar) {
      run_with_progress(evt.data)
    } else {
      run_without_progress(evt.data)
    }
  });
}

function run_with_progress({ method, n_seats, n_voters, parties }: WasmRunArgs) {
  let counter = 1
  for (let y = 100; y > -100; y--) {
    for (let x = -100; x < 100; x++) {
      try {
        const single_answer: SimulationResult =
          simulate_single_election(
            method, n_seats, n_voters, parties, x / 100, y / 100
          )
        self.postMessage({ single_answer, counter })
      } catch (e) {
        self.postMessage({ error: e });
        return
      }
      counter += 1
    }
  }
}

function run_without_progress({ method, n_seats, n_voters, parties }: WasmRunArgs) {
  try {
    const r: SimulationResults =
      simulate_elections(method, n_seats, n_voters, parties);
    self.postMessage({ answer: r })
  } catch (e) {
    self.postMessage({ error: e });
    return
  }
}

self.onmessage = main
