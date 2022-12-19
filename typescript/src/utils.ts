import * as PIXI from 'pixi.js'
import { Party } from "./types";

const app = new PIXI.Application({ background: '#fff', height: 500, width: 500 });
let dragTarget: PIXI.Graphics | null = null;

export function setup_pixi() {
  // @ts-ignore
  document.getElementById('chart').appendChild(app.view);
  app.stage.interactive = true;
  app.stage.hitArea = app.screen;
  app.stage.on('pointerup', onDragEnd)
  app.stage.on('pointerupoutside', onDragEnd)
  PIXI.settings.SORTABLE_CHILDREN = true
  return app.stage
}

export function plot_party_core(stage: PIXI.Container, parties: Array<Party>) {
  //.attr('num', d => d.num)
  //.attr('class', 'party-circle')
  parties.forEach(p => {
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(0);
    graphics.beginFill(p.color, 1);
    graphics.drawCircle(0, 0, 20);
    graphics.endFill();
    graphics.interactive = true
    graphics.cursor = 'pointer'
    graphics.on('pointerdown', onDragStart, graphics);
    graphics.position = {x: p.x, y: p.y}
    graphics.zIndex = 1
    stage.addChild(graphics);
  })
}

export function onDragMove(event: PIXI.FederatedPointerEvent) {
    if (dragTarget) {
        dragTarget.parent.toLocal(event.global, undefined, dragTarget.position);
    }
}

export function onDragStart(this: PIXI.Graphics) {
    this.alpha = 0.5;
    dragTarget = this;
    app.stage.on('pointermove', onDragMove);
}

export function onDragEnd() {
    if (dragTarget) {
        app.stage.off('pointermove', onDragMove);
        dragTarget.alpha = 1;
        dragTarget = null;
    }
}

export function color_str_to_num(hex: string): number {
  return parseInt(hex.slice(1), 16)
}

export function color_num_to_string(hex: number): string {
  return '#' + hex.toString(16)
}

export function x_scale(coord_x: number) {
  const percentage = (coord_x + 1) / 2
  return 500 * percentage
}

export function y_scale(coord_y: number) {
  const percentage = (coord_y + 1) / 2
  return 500 * (1 - percentage)
}

export function unscale_x(canvas_x: number) {
  const percentage = canvas_x / 500
  return percentage * 2 - 1
}

export function unscale_y(canvas_y: number) {
  const percentage = canvas_y / 500
  return (1 - percentage) * 2 - 1
}

