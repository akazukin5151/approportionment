import * as PIXI from 'pixi.js'
import { Party, InfoGraphics } from './types';
import { DEFAULT_PARTIES } from './constants';
import { unscale_x, unscale_y } from './utils';

export function load_parties(stage: PIXI.Container): Array<Party> {
  const elems = stage.children;
  if (elems && elems.length !== 0) {
    return Array.from(elems)
      // For some reason, there are extra children in the stage after moving
      // the party points
      .filter(elem => elem instanceof InfoGraphics && elem.num !== undefined)
      .map((e) => {
        const elem = e as InfoGraphics
        const cx = elem.x
        const cy = elem.y
        const x = unscale_x(cx)
        const y = unscale_y(cy)
        const color: number = elem.color
        const num: number = elem.num
        return { x, y, color, num }
      })
      .sort((a, b) => a.num - b.num)
  }
  return DEFAULT_PARTIES
}
