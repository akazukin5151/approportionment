import init, { run } from "libapproportionment";
import { SimulationResult, WasmRunArgs } from './types';

function main(evt: MessageEvent<WasmRunArgs>): void {
  const parties = evt.data.parties;
  const method = evt.data.method;
  const n_seats = evt.data.n_seats;
  const n_voters = evt.data.n_voters;
  init().then(() => {
    let r: SimulationResult | null = null;
    try {
      r = run(method, n_seats, n_voters, parties);
    } catch (e) {
      self.postMessage({ error: e });
      return
    }
    if (r) {
      self.postMessage({ answer: r })
    }
  });
}

self.onmessage = main
