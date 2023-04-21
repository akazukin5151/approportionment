import { AllCanvases } from "../../types/canvas";
import { Party } from "../../types/election";
import { CANDIDATE_BASED_METHODS, PARTY_CANVAS_SIZE, PARTY_RADIUS } from "../../constants";
import { get_method } from "../../form";
import { computePosition, arrow, flip, shift, ClientRectObject } from "@floating-ui/dom";
import { clear_legend_highlight } from "../../td";
import { cache, coalition_bar_chart, party_bar_chart, party_manager } from "../../cache";
import { GridCoords } from "../../types/position";
import { offset, VirtualElement } from "@floating-ui/core";
import { RngArgs } from "../../types/wasm";
import { PartyManager } from "../../party";
import { plot_voronoi, voronoi_enabled } from "../../setup/setup_voronoi";
import { plot_party_on_wheel } from "../../color_wheel/plot";
import { hide_voter_canvas } from "../../plot/party/utils";
import { plot_parties, plot_single_party } from "../../plot/party/plot_party";

let current_party_num: number | null = null

export function set_position(
  evt: MouseEvent,
  floating: HTMLElement,
  p: Party,
  all_canvases: AllCanvases,
): void {
  const virtual_elem = {
    getBoundingClientRect(): ClientRectObject {
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
export function toggle_dropdown(
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
  all_canvases: AllCanvases,
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
    setup_floating_window(p, all_canvases, floating)
  })
}

function setup_floating_window(
  p: Party,
  all_canvases: AllCanvases,
  floating: HTMLElement,
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
        floating.style.display = 'none'
        current_party_num = null
      }
    }
  )

  const method = get_method(null)
  // TODO: pass it in or use global
  const add_near_btn = document.getElementById('near-btn') as HTMLElement
  if (CANDIDATE_BASED_METHODS.includes(method)) {
    add_near_btn.style.display = 'block'
  } else {
    add_near_btn.style.display = 'none'
  }
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
    party_bar_chart.zero()
    coalition_bar_chart.zero()
    clear_legend_highlight()
    party_manager.party_changed = true
  })
}

export function on_near_click(worker: Worker): void {
  if (current_party_num == null) {
    return
  }
  // tell typescript that this is never null after this point
  const n: number = current_party_num

  const p = party_manager.parties[n]!
  const coalition_num = party_manager.coalitions.get_coalition_num(n)
  const msg: RngArgs = {
    mean_x: p.grid_x,
    mean_y: p.grid_y,
    stdev: 0.1,
    coalition_num: coalition_num?.toString() ?? ''
  }
  worker.postMessage(msg)
}

function delete_party(
  pm: PartyManager,
  num: number,
  all_canvases: AllCanvases
): void {
  pm.delete(num)
  all_canvases.party.ctx.clearRect(0, 0, PARTY_CANVAS_SIZE, PARTY_CANVAS_SIZE)
  pm.parties.forEach(party => plot_single_party(all_canvases.party, party))
  party_bar_chart.delete_bar(num)
  party_bar_chart.zero()
  coalition_bar_chart.zero()
  clear_legend_highlight()
  if (voronoi_enabled()) {
    plot_voronoi(all_canvases.voronoi.ctx)
  }
  pm.party_changed = true
}

function replot_parties(
  all_canvases: AllCanvases,
  pm: PartyManager,
): void {
  const parties = pm.parties
  all_canvases.party.ctx.clearRect(0, 0, PARTY_CANVAS_SIZE, PARTY_CANVAS_SIZE)
  hide_voter_canvas(all_canvases, all_canvases.voter)
  plot_parties(all_canvases.party, parties)
  if (voronoi_enabled()) {
    plot_voronoi(all_canvases.voronoi.ctx)
  }
  if (cache) {
    cache.parties = parties
  }
}

function update_party_on_wheel(): void {
  if (cache) {
    const legend_table = document.getElementById('legend-table') as HTMLElement
    const header_tr = legend_table.children[1]?.children[0]
    const quantity_td = header_tr?.children[1] as HTMLElement
    const quantity_name = quantity_td.innerText
    if (quantity_name === 'Party') {
      plot_party_on_wheel(cache)
    }
  }
}

