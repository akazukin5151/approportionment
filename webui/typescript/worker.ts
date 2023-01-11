import init, { run } from "libapproportionment";
import { Simulation, Message } from './types';

function main(evt: MessageEvent<Message>): void {
  const parties = evt.data.parties;
  const method = evt.data.method;
  const n_seats = evt.data.n_seats;
  const n_voters = evt.data.n_voters;
  init().then(() => {
    const parties_with_name = parties.map(({ x_pct, y_pct }) => ({
      x: x_pct, y: y_pct, color: null, name: null
    }))

    let r: Simulation | null = null;
    try {
      r = run(method, n_seats, n_voters, parties_with_name);
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
