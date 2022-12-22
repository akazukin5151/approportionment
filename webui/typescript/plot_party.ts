import * as PIXI from 'pixi.js'
import { onDragStart } from './pixi';
import { InfoGraphics, Party } from "./types";

export function plot_party_core(stage: PIXI.Container, parties: Array<Party>) {
  parties.forEach(p => plot_single_party(stage, p.num, p.color, p.x, p.y))
}

export function plot_single_party(
  stage: PIXI.Container,
  num: number,
  color: number,
  x: number,
  y: number
) {
    const infographics = new InfoGraphics({ num, color });
    infographics.lineStyle(2, 0xffffff, 1);
    infographics.beginFill(color, 1);
    infographics.drawCircle(0, 0, 20);
    infographics.endFill();
    infographics.interactive = true
    infographics.cursor = 'pointer'
    infographics.on('pointerdown', onDragStart, infographics);
    infographics.position = { x, y }
    infographics.zIndex = 1
    stage.addChild(infographics);
}

