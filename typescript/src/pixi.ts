import * as PIXI from 'pixi.js'
import { Party } from "./types";
import { unscale_x, unscale_y } from './utils';

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
  parties.forEach(p => {
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(0);
    graphics.beginFill(p.color, 1);
    graphics.drawCircle(0, 0, 20);
    graphics.endFill();
    graphics.interactive = true
    graphics.cursor = 'pointer'
    graphics.on('pointerdown', onDragStart, graphics);
    graphics.position = { x: p.x, y: p.y }
    graphics.zIndex = 1
    // @ts-ignore
    graphics.num = p.num
    // @ts-ignore
    graphics.color = p.color
    stage.addChild(graphics);
  })
}

export function onDragMove(event: PIXI.FederatedPointerEvent) {
  if (dragTarget) {
    dragTarget.parent.toLocal(event.global, undefined, dragTarget.position);
    const table = document.getElementById('party_table')
    const tbody = table?.children[0]
    if (!tbody) { return }
    Array.from(tbody.children).forEach(tr => {
      const num_str = tr.children[1] as HTMLInputElement
      // @ts-ignore
      const drag_target_num: number = dragTarget.num
      if (num_str && parseInt(num_str.innerText) === drag_target_num) {
        tr.children[3].innerHTML = unscale_x(event.client.x).toFixed(5)
        tr.children[4].innerHTML = unscale_y(event.client.y).toFixed(5)
      }
    })
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
