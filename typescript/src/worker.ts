import init, { run } from "libapproportionment";

// This array has a len of 200 * 200 (the domain and range of the graph)
type Simulation = Array<
  // This array always has a len of 2. It is a tuple of (voter means, seats by party)
  Array<
    // Voter means: The array always has len of 2, as it is a tuple of (x, y)
    // Seats by party: The array always has len of n_parties. The value of the ith element
    // is the number of seats won by the ith party
    Array<number>
  >
>;

type Color = string;

type Circle = { x: number, y: number, color: Color };

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
