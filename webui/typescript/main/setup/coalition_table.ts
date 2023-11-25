import { add_drop_listeners } from "../coalition_table/drag_and_drop";
import { add_coalition } from "../coalition_table/add_coalition";
import { array_max } from "../std_lib";
import { AllCanvases } from "../types/canvas";

export function setup_coalition_table(all_canvases: AllCanvases): void {
  const add_btn = document.getElementById('add-coalition-btn')! as HTMLElement;
  const table = document.getElementById('coalition-table')!;
  const tbody = table.getElementsByTagName("tbody")[0]!;
  add_btn.onclick = (): void => {
    const num = find_next_coalition_num(tbody)
    add_coalition(tbody, num, all_canvases, false)
  }
  // add drop listeners to the none row
  const td = tbody.lastElementChild!.children[1]!
  const container = td.children[0] as HTMLDivElement
  add_drop_listeners(container, all_canvases.simulation)
}

function find_next_coalition_num(tbody: Element): number {
  const nums = Array.from(tbody.children)
    .map(row => {
      const num = row.children[0] as HTMLElement
      return parseInt(num.innerText)
    })
  return array_max(nums) + 1
}

