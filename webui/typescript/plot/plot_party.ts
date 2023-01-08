import * as PIXI from 'pixi.js'
import { on_drag_start } from '../setup/pixi_drag';
import { InfoGraphics, Party } from "../types";
import { load_parties } from '../load_parties'
import { x_scale, y_scale } from '../utils';

export function plot_party_core(stage: PIXI.Container, parties: Array<Party>): void {
  parties.forEach(p => plot_single_party(stage, p.num, p.color, p.x, p.y))
}

export function plot_single_party(
  stage: PIXI.Container,
  num: number,
  color: number,
  x: number,
  y: number
): void {
  const infographics = new InfoGraphics({ num, color });
  infographics.lineStyle(2, 0xffffff, 1);
  infographics.beginFill(color, 1);
  infographics.drawCircle(0, 0, 20);
  infographics.endFill();
  infographics.interactive = true
  infographics.cursor = 'pointer'
  infographics.on('pointerdown', on_drag_start, infographics);
  infographics.position = { x, y }
  infographics.zIndex = 1
  stage.addChild(infographics);
}

export function plot_default(stage: PIXI.Container): void {
  const parties = load_parties(stage);

  const p = parties
    .map(({ x, y, color, num }) => ({ x: x_scale(x), y: y_scale(y), color, num }));

  plot_party_core(stage, p)
}
