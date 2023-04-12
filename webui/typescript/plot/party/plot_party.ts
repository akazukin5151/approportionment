import { Canvas, AllCanvases } from "../../types/canvas";
import { Party } from "../../types/election";
import { on_pointer_move } from '../hover/hover'
import { on_drag_start } from './drag/drag'
import { clear_canvas } from "../../canvas";
import { PARTY_CANVAS_SIZE, PARTY_RADIUS, TAU } from "../../constants";
import { hide_voter_canvas } from "./utils";
import { clear_coalition_seats, get_canvas_dimensions } from "../../form";
import { computePosition, arrow, flip, shift } from "@floating-ui/dom";
import { clear_legend_highlight } from "../../td";
import { party_manager } from "../../cache";
import { replot_parties, update_party_on_wheel } from "../../party_table/utils";
import { GridCoords } from "../../types/position";
import { delete_party } from "../../party_table/delete_party";
import { offset, VirtualElement } from "@floating-ui/core";

const DELTA = 6
let start_x: number
let start_y: number
let current_party_num: number | null = null

/** Use this function when event handlers are already set.
 * This prevents multiple callbacks being triggered and slowing down the site.
 * If they are not set yet, use plot_party_with_listeners instead */
export function plot_parties(party_canvas: Canvas, parties: Array<Party>): void {
  clear_canvas(party_canvas.ctx)
  parties.forEach(p => plot_single_party(party_canvas, p))
}

export function plot_single_party(canvas: Canvas, party: Party): void {
  const x = party.x_pct * PARTY_CANVAS_SIZE
  const y = party.y_pct * PARTY_CANVAS_SIZE
  canvas.ctx.beginPath()
  canvas.ctx.arc(x, y, PARTY_RADIUS, 0, TAU, true)
  canvas.ctx.closePath()
  canvas.ctx.fillStyle = party.color
  canvas.ctx.fill()
  canvas.ctx.strokeStyle = '#ffffff'
  canvas.ctx.lineWidth = 2
  canvas.ctx.stroke()
}

export function setup_party_canvas(
  all_canvases: AllCanvases,
): void {
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
  // floating.style.top = '40vh'
  // floating.style.left = '60vw'
  // setup_floating_window(p, pm, all_canvases)
}

function set_position(
  evt: MouseEvent,
  floating: HTMLElement,
  p: Party,
  all_canvases: AllCanvases
): void {
  const virtual_elem = {
    getBoundingClientRect() {
      return {
        width: PARTY_RADIUS,
        height: PARTY_RADIUS,
        // TODO: use party coords
        x: evt.offsetX,
        y: evt.offsetY,
        top: evt.offsetY - PARTY_RADIUS / 2,
        left: evt.offsetX - PARTY_RADIUS / 2,
        right: evt.offsetX + PARTY_RADIUS / 2,
        bottom: evt.offsetY + PARTY_RADIUS / 2,
      }
    }
  }

  update_position(virtual_elem, floating, p, all_canvases)
}

// TODO: copied from setup/dropdown.ts
function toggle_dropdown(
  dropdown: HTMLElement,
  dropdown_id: string
): void {
  if (dropdown.style.display === 'none') {
    dropdown.style.display = 'block'
    // FIXME: this will close the popup immediately
    // const listener =
    //   (e: Event): void => hide_dropdown(dropdown_id, dropdown, listener, e)
    // document.body.addEventListener('click', listener)
  } else {
    dropdown.style.display = 'none'
  }
}

function hide_dropdown(
  dropdown_id: string,
  dropdown: HTMLElement,
  listener: (evt: Event) => void,
  evt: Event
): void {
  if (!evt.target || !(evt.target instanceof HTMLElement)) {
    return
  }
  let p: ParentNode | null = evt.target
  while (p) {
    if ('id' in p && p.id === dropdown_id) {
      return
    }
    p = p.parentNode
  }
  evt.preventDefault()
  dropdown.style.display = 'none'
  document.body.removeEventListener('click', listener)
}

function update_position(
  virtual_elem: VirtualElement,
  floating: HTMLElement,
  p: Party,
  all_canvases: AllCanvases
): void {
  const arrow_elem = document.getElementById('arrow')!
  computePosition(virtual_elem, floating, {
    placement: 'right',
    middleware: [
      offset({
        mainAxis: 85,
        crossAxis: 0,
      }),
      flip(),
      shift(),
      // FIXME: arrow not visible
      arrow({
        element: arrow_elem
      }),
    ]
  }).then(({ x, y, middlewareData }) => {
    floating.style.top = `${y}px`
    floating.style.left = `${x}px`
    const a = middlewareData.arrow
    if (a) {
      arrow_elem.style.left = a.x != null ? `${x}px` : ''
      arrow_elem.style.top = a.y != null ? `${y}px` : ''
    }
    setup_floating_window(p, all_canvases)
  })
}

function setup_floating_window(
  p: Party,
  all_canvases: AllCanvases
): void {
  const input_x = document.getElementById('p-x') as HTMLInputElement
  setup_input(input_x,
    p.grid_x,
    value => ({
      grid_x: value,
      grid_y: p.grid_y,
    }),
    all_canvases,
  )

  const input_y = document.getElementById('p-y') as HTMLInputElement
  setup_input(input_y,
    p.grid_y,
    value => ({
      grid_x: p.grid_x,
      grid_y: value
    }),
    all_canvases,
  )

  const input_color = document.getElementById('p-color') as HTMLInputElement
  input_color.value = p.color
  input_color.addEventListener('change', () => {
    if (current_party_num !== null) {
      party_manager.update_color(current_party_num, input_color.value)
      replot_parties(all_canvases, party_manager)
      update_party_on_wheel()
    }
  })

  const delete_button = document.getElementById('p-delete') as HTMLInputElement
  delete_button.addEventListener(
    'click',
    () => {
      if (current_party_num !== null) {
        delete_party(party_manager, current_party_num, all_canvases)
      }
    }
  )
}

function setup_input(input: HTMLInputElement,
  value: number,
  builder: (value: number) => GridCoords,
  all_canvases: AllCanvases,
): void {
  input.value = value.toFixed(2)
  input.addEventListener('input', () => {
    if (current_party_num !== null) {
      party_manager.update_grid(current_party_num, builder(parseFloat(input.value)))
    }
    replot_parties(all_canvases, party_manager)
    // TODO: clear party bar
    clear_coalition_seats()
    clear_legend_highlight()
    party_manager.party_changed = true
  })
}

