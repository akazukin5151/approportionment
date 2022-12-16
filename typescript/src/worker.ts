import init, { run } from "libapproportionment";
import { Simulation, Circle } from './types';

function main(evt: MessageEvent<{parties: Circle[]}>) {
  const parties = evt.data.parties;
  init().then(() => {

    const parties_with_name = parties.map(({ x, y, color: _ }) => ({ x, y }))

    let r: Simulation | null = null;
    try {
      r = run("DHondt", 100, 1000, parties_with_name);
    } catch (e) {
      // TODO
      console.log(e);
    }
    if (!r) {
      // TODO
      return
    }
    self.postMessage({answer: r})

  });
}

self.onmessage = main
