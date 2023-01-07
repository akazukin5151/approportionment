import * as PIXI from 'pixi.js'
import { calculate_coalition_seats, set_coalition_seat } from './coalition_table';
import { cache } from './setup_worker';
import { InfoGraphics } from "./types";
import { unscale_x, unscale_y } from './utils';

const app = new PIXI.Application({ background: '#fff', height: 500, width: 500 });
let dragTarget: InfoGraphics | null = null;

export function setup_pixi() {
  document.getElementById('chart')!.appendChild(app.view as unknown as Node)
    .addEventListener('mousemove', on_pointer_move);
  app.stage.interactive = true;
  app.stage.hitArea = app.screen;
  app.stage.on('pointerup', onDragEnd)
  app.stage.on('pointerupoutside', onDragEnd)
  PIXI.settings.SORTABLE_CHILDREN = true
  return app.stage
}

function onDragMove(event: PIXI.FederatedPointerEvent): void {
  if (dragTarget) {
    dragTarget.parent.toLocal(event.global, undefined, dragTarget.position);
    const table = document.getElementById('party-table')
    const tbody = table?.children[0]
    if (!tbody) { return }
    Array.from(tbody.children).forEach(tr => {
      const num_str = tr.children[1] as HTMLInputElement
      const drag_target_num: number = dragTarget!.num
      if (parseInt(num_str.innerText) === drag_target_num) {
        tr.children[3]!.innerHTML = unscale_x(event.globalX).toFixed(2)
        tr.children[4]!.innerHTML = unscale_y(event.globalY).toFixed(2)
      }
    })
  }
}

export function onDragStart(this: InfoGraphics): void {
  this.alpha = 0.5;
  // "If you need to assign this to variables, you shouldn’t use this rule."
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  dragTarget = this;
  app.stage.on('pointermove', onDragMove);
}

function onDragEnd(): void {
  if (dragTarget) {
    app.stage.off('pointermove', onDragMove);
    dragTarget.alpha = 1;
    dragTarget = null;
  }
}

function on_pointer_move(evt: Event): void {
  if (!cache) {
    return
  }
  const e = evt as MouseEvent
  const target = e.target! as HTMLElement
  const max_y = target.clientHeight + target.offsetTop
  const max_x = target.clientWidth + target.offsetLeft
  const norm_x = e.offsetX / max_x
  const norm_y = e.offsetY / max_y
  // scaled to grid coordinates
  const scaled_x = norm_x * 2 - 1
  const scaled_y = -1 * ((norm_y) * 2 - 1)
  const closest_point = cache
    .map(point => {
      return {
        point: point,
        distance:
          Math.sqrt((point.x - scaled_x) ** 2 + (point.y - scaled_y) ** 2)
      }
    })
    .reduce((acc, x) => x.distance < acc.distance ? x : acc)

  const seats_by_party = closest_point.point.seats_by_party

  const table = document.getElementById('party-table')!
  const tbody = table.children[0]!
  Array.from(tbody.children).forEach((tr, idx) => {
    if (idx === 0) {
      return
    }
    const seats_col = tr.children[5] as HTMLElement
    // the first idx for the table is the header row
    seats_col.innerText = seats_by_party[idx - 1]!.toString()

    const coalition_col = tr.children[6]!.children[0]!;
    const coalition = (coalition_col as HTMLSelectElement).selectedOptions[0]!
    const seats = calculate_coalition_seats(coalition.text)
    set_coalition_seat(coalition.text, seats)
  })
}
