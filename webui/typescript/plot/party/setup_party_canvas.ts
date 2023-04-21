import { AllCanvases } from "../../types/canvas";
import { on_pointer_move } from '../hover/hover'
import { on_drag_start } from './drag'
import { hide_voter_canvas } from "./utils";
import { get_canvas_dimensions } from "../../form";
import { party_manager } from "../../cache";
import { plot_single_party } from "./plot_party";
import { on_near_click, set_position, toggle_dropdown } from "./popup";

const DELTA = 6
let start_x: number
let start_y: number
let current_party_num: number | null = null

export function setup_party_canvas(
  all_canvases: AllCanvases,
  worker: Worker
): void {
  // this isn't party canvas but relies on current_party_num
  const add_near_btn = document.getElementById('near-btn') as HTMLElement
  add_near_btn.addEventListener('click', () => on_near_click(worker))

  const { party, voter, simulation } = all_canvases
  party.elem.addEventListener('mousemove',
    e => on_pointer_move(simulation, voter, e)
  )
  party.elem.addEventListener(
    'mousedown',
    e => {
      start_x = e.pageX
      start_y = e.pageY
      on_drag_start(all_canvases, e, plot_single_party)
    }
  )
  const floating = document.getElementById('floating') as HTMLElement
  floating.style.display = 'none'
  party.elem.addEventListener(
    'mouseup',
    e => {
      const diff_x = Math.abs(e.pageX - start_x);
      const diff_y = Math.abs(e.pageY - start_y);

      if (diff_x < DELTA && diff_y < DELTA) {
        on_party_click(e, floating, all_canvases)
      }
    }
  )
  party.elem.addEventListener('mouseleave', () =>
    hide_voter_canvas(all_canvases, voter)
  )
}

function on_party_click(
  e: Event,
  floating: HTMLElement,
  all_canvases: AllCanvases,
): void {
  const evt = e as MouseEvent
  const p = party_manager.find_hovered_party(
    evt.offsetX, evt.offsetY, get_canvas_dimensions()
  )
  if (!p) {
    return
  }
  if (current_party_num === null || p.num === current_party_num) {
    toggle_dropdown(floating, 'floating')
  }
  current_party_num = p.num

  set_position(evt, floating, p, all_canvases)
}

