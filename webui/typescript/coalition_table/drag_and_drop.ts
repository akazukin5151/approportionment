import { party_manager } from "../cache"
import { replot } from "../plot/replot"
import { Canvas } from "../types/canvas"

export function create_party_drop_td(
  simulation_canvas: Canvas
): HTMLTableCellElement {
  const td = document.createElement('td')
  const div = document.createElement('div')
  div.className = 'party-dot-area'
  add_drop_listeners(div, simulation_canvas)
  td.appendChild(div)
  return td
}

export function add_drop_listeners(
  div: HTMLDivElement,
  simulation_canvas: Canvas
): void {
  div.addEventListener(
    'drop',
    ev => {
      ev.preventDefault()
      ev.dataTransfer!.dropEffect = "move"
      const elem_id = ev.dataTransfer!.getData("text/plain")
      const party_num = parseInt(elem_id.slice('party-dot-'.length))

      const party_dot_area = ev.target as HTMLElement
      const col_2 = party_dot_area.parentElement
      const col_1 = col_2?.previousElementSibling as HTMLElement
      // the 'None' cell doesn't have a div around it
      // coalition numbers have a div around them, but innerText works anyway
      const n = col_1.innerText
      const coalition_num = n === 'None' ? null : parseInt(n)
      party_manager.coalitions.modify(party_num, coalition_num)
      replot(simulation_canvas)
    }
  )
  div.addEventListener(
    'dragover',
    ev => {
      ev.preventDefault()
      const elem = ev.target as HTMLElement
      // prevent dropping into another party dot, overlapping them
      if (elem.draggable) {
        return
      }
      const data = ev.dataTransfer!.getData("text/plain")
      elem.appendChild(document.getElementById(data)!)

      const party_num = parseInt(data.slice('party-dot-'.length))
      const row = elem.parentElement!.parentElement!
      const cnum_td = row.children[0] as HTMLElement
      const n = cnum_td.innerText
      const coalition_num = n === 'None' ? null : parseInt(n)
      party_manager.coalitions.modify(party_num, coalition_num)

      // TODO replot if we are colorizing by coalition and that coalition has changed
    }
  )
}

