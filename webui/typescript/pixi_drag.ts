import * as PIXI from 'pixi.js'
import {
  calculate_coalition_seats,
  set_coalition_seat
} from './coalition_table/coalition_table';
import { cache } from './setup/setup_worker';
import { InfoGraphics, Point } from "./types";
import { unscale_x, unscale_y } from './utils';

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

function onDragMove(event: PIXI.FederatedPointerEvent): void {
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
  app.stage.on('pointermove', onDragMove);
}

function on_drag_end(): void {
  if (drag_target) {
    app.stage.off('pointermove', onDragMove);
    drag_target.alpha = 1;
    drag_target = null;
  }
}

function on_pointer_move(evt: Event): void {
  if (!cache) {
    return
  }
  const e = evt as MouseEvent
  const target = e.target! as HTMLElement
  const scaled = scale_pointer_to_grid(target, e)
  const closest_point = find_closest_point(cache, scaled)
  const seats_by_party = closest_point.point.seats_by_party

  const party_table = document.getElementById('party-table')!
  const party_tbody = party_table.children[0]!
  Array.from(party_tbody.children).forEach((party_tr, idx) => {
    recalculate_all_seats(seats_by_party, party_tr, idx)
  })
}

type Scaled = { x: number; y: number; }

function scale_pointer_to_grid(target: HTMLElement, e: MouseEvent): Scaled {
  const max_y = target.clientHeight + target.offsetTop
  const max_x = target.clientWidth + target.offsetLeft
  const norm_x = e.offsetX / max_x
  const norm_y = e.offsetY / max_y
  // scaled to grid coordinates
  const scaled_x = norm_x * 2 - 1
  const scaled_y = -1 * ((norm_y) * 2 - 1)
  return { x: scaled_x, y: scaled_y }
}

function find_closest_point(cache: Array<Point>, scaled: Scaled) {
  return cache
    .map(point => {
      return {
        point: point,
        distance:
          Math.sqrt((point.x - scaled.x) ** 2 + (point.y - scaled.y) ** 2)
      }
    })
    .reduce((acc, x) => x.distance < acc.distance ? x : acc)
}

// recalculate party seats and coalition seats and update the numbers in the HTML
function recalculate_all_seats(
  seats_by_party: Array<number>,
  party_tr: Element,
  idx: number
) {
  if (idx === 0) {
    return
  }
  // set the seats in the party table
  const seats_col = party_tr.children[5] as HTMLElement
  // the first idx for the table is the header row
  seats_col.innerText = seats_by_party[idx - 1]!.toString()

  // recalculate coalition seats
  const coalition_col = party_tr.children[6]!.children[0]!;
  const coalition = (coalition_col as HTMLSelectElement).selectedOptions[0]!
  const seats = calculate_coalition_seats(coalition.text)
  set_coalition_seat(coalition.text, seats)
}

