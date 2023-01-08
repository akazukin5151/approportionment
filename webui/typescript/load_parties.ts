import * as PIXI from 'pixi.js'
import { Party, InfoGraphics } from './types';
import { DEFAULT_PARTIES } from './constants';
import { unscale_x, unscale_y } from './utils';

export function load_parties(stage: PIXI.Container): Array<Party> {
  const elems = stage.children;
  if (elems.length !== 0) {
    return Array.from(elems)
      // For some reason, there are extra children in the stage after moving
      // the party points
      .filter(elem => elem instanceof InfoGraphics)
      .map((e) => {
        const elem = e as InfoGraphics
        return {
          x: unscale_x(elem.x),
          y: unscale_y(elem.y),
          color: elem.color,
          num: elem.num
        }
      })
      .sort((a, b) => a.num - b.num)
  }
  return DEFAULT_PARTIES
}
