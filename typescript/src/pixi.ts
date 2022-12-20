import * as PIXI from 'pixi.js'
import { cache } from './setup';
import { InfoGraphics, Party } from "./types";
import { unscale_x, unscale_y } from './utils';

const app = new PIXI.Application({ background: '#fff', height: 500, width: 500 });
let dragTarget: InfoGraphics | null = null;

export function setup_pixi() {
  // @ts-ignore
  document.getElementById('chart').appendChild(app.view)
    .addEventListener('mousemove', on_pointer_move);
  app.stage.interactive = true;
  app.stage.hitArea = app.screen;
  app.stage.on('pointerup', onDragEnd)
  app.stage.on('pointerupoutside', onDragEnd)
  PIXI.settings.SORTABLE_CHILDREN = true
  return app.stage
}

export function plot_party_core(stage: PIXI.Container, parties: Array<Party>) {
  parties.forEach(p => {
    const infographics = new InfoGraphics({ num: p.num, color: p.color });
    infographics.lineStyle(2, 0xffffff, 1);
    infographics.beginFill(p.color, 1);
    infographics.drawCircle(0, 0, 20);
    infographics.endFill();
    infographics.interactive = true
    infographics.cursor = 'pointer'
    infographics.on('pointerdown', onDragStart, infographics);
    infographics.position = { x: p.x, y: p.y }
    infographics.zIndex = 1
    stage.addChild(infographics);
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
      const drag_target_num: number = dragTarget!.num
      if (num_str && parseInt(num_str.innerText) === drag_target_num) {
        tr.children[3].innerHTML = unscale_x(event.client.x).toFixed(5)
        tr.children[4].innerHTML = unscale_y(event.client.y).toFixed(5)
      }
    })
  }
}

export function onDragStart(this: InfoGraphics) {
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

export function on_pointer_move(evt: Event) {
  if (!cache) {
    return
  }
  const e = evt as MouseEvent
  const target = e.target! as HTMLElement
  const max_y = target.clientHeight + target.offsetTop
  const max_x = target.clientWidth + target.offsetLeft
  const norm_x = e.pageX / max_x
  const norm_y = e.pageY / max_y
  // scaled to grid coordinates
  const scaled_x = norm_x * 2 - 1
  const scaled_y = (1 - norm_y) * 2 - 1
  const sorted = cache
    .map(point => {
      return {
        point: point,
        distance:
          Math.sqrt((point.x - scaled_x) ** 2 + (point.y - scaled_y) ** 2)
      }
    })
    .sort((a, b) => a.distance - b.distance)

  const seats_by_party = sorted[0].point.seats_by_party

  const table = document.getElementById('party_table')!
  const tbody = table.children[0]
  Array.from(tbody.children).forEach((tr, idx) => {
    if (idx === 0) {
      return
    }
    const seats_col = tr.children[5] as HTMLElement
    // the first idx for the table is the header row
    seats_col.innerText = seats_by_party[idx - 1].toString()
  })
}
