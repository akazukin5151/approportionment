import * as PIXI from 'pixi.js'
import { InfoGraphics } from "../types";
import { unscale_x, unscale_y } from '../utils';
import { on_pointer_move } from './hover';

const app = new PIXI.Application({ background: '#fff', height: 500, width: 500 });
let drag_target: InfoGraphics | null = null;

export function setup_pixi() {
  document.getElementById('chart')!.appendChild(app.view as unknown as Node)
    .addEventListener('mousemove', on_pointer_move);
  app.stage.interactive = true;
  app.stage.hitArea = app.screen;
  app.stage.on('pointerup', on_drag_end)
  app.stage.on('pointerupoutside', on_drag_end)
  PIXI.settings.SORTABLE_CHILDREN = true
  return app.stage
}

function on_drag_move(event: PIXI.FederatedPointerEvent): void {
  if (drag_target) {
    drag_target.parent.toLocal(event.global, undefined, drag_target.position);
    const table = document.getElementById('party-table')
    const tbody = table?.children[0]
    if (!tbody) { return }
    Array.from(tbody.children).forEach(tr => {
      const num_str = tr.children[1] as HTMLInputElement
      const drag_target_num: number = drag_target!.num
      if (parseInt(num_str.innerText) === drag_target_num) {
        tr.children[3]!.innerHTML = unscale_x(event.globalX).toFixed(2)
        tr.children[4]!.innerHTML = unscale_y(event.globalY).toFixed(2)
      }
    })
  }
}

export function on_drag_start(this: InfoGraphics): void {
  this.alpha = 0.5;
  // "If you need to assign this to variables, you shouldn’t use this rule."
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  drag_target = this;
  app.stage.on('pointermove', on_drag_move);
}

function on_drag_end(): void {
  if (drag_target) {
    app.stage.off('pointermove', on_drag_move);
    drag_target.alpha = 1;
    drag_target = null;
  }
}

