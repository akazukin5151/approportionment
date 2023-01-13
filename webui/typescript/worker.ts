import init, { run, run_2 } from "libapproportionment";
import { SimulationResults, SimulationResult, WasmRunArgs } from './types';

function main(evt: MessageEvent<WasmRunArgs>): void {
  const parties = evt.data.parties;
  const method = evt.data.method;
  const n_seats = evt.data.n_seats;
  const n_voters = evt.data.n_voters;
  init().then(() => {
    if (evt.data.real_time_progress_bar) {
      let counter = 1
      for (let x = -100; x < 100; x++) {
        for (let y = 100; y > -100; y--) {
          const single_answer: SimulationResult =
            run_2(method, n_seats, n_voters, parties, x / 100, y / 100)
          self.postMessage({ single_answer, counter })
          counter += 1
        }
      }
    } else {
      let r: SimulationResults | null = null;
      try {
        r = run(method, n_seats, n_voters, parties);
      } catch (e) {
        self.postMessage({ error: e });
        return
      }
      if (r) {
        self.postMessage({ answer: r })
      }
    }
  });
}

self.onmessage = main
