import * as PIXI from 'pixi.js'

export type Message = {
  parties: Party[],
  method: string,
  n_seats: number,
  n_voters: number,
};

export type WorkerMessage = {
  answer: Simulation | null,
  error: string | null
}

// This array has a len of 200 * 200 (the domain and range of the graph)
export type Simulation = Array<
  // This array always has a len of 2. It is a tuple of (voter means, seats by party)
  Array<
    // Voter means: The array always has len of 2, as it is a tuple of (x, y)
    // Seats by party: The array always has len of n_parties. The value of the ith element
    // is the number of seats won by the ith party
    Array<number>
  >
>;

export type Point = {
  x: number,
  y: number,
  color: number,
  seats_by_party: number[]
};

export type Party = {
  x: number,
  y: number,
  color: number,
  num: number
};

// PIXI.Graphics with num and color infomation
export class InfoGraphics extends PIXI.Graphics {
  num: number
  color: number

  constructor({num, color}: {num: number, color: number}) {
    super()
    this.num = num
    this.color = color
  }
}
