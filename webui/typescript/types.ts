import * as PIXI from 'pixi.js'

export type Message = {
  parties: Array<Party>,
  method: string,
  n_seats: number,
  n_voters: number,
};

export type WorkerMessage = {
  answer: Simulation | null,
  error: string | null
}

// This array has a len of 200 * 200 (the domain and range of the graph)
export type Simulation = Array<{
  voter_mean: { x: number, y: number },
  seats_by_party: Array<number>
}>;

export type Point = {
  x: number,
  y: number,
  color: number,
  seats_by_party: Array<number>
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

  constructor({ num, color }: { num: number, color: number }) {
    super()
    this.num = num
    this.color = color
  }
}
