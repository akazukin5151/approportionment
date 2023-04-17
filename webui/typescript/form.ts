/** Functions that involve querying and modifying the form values through the DOM **/
import { ColorizeBy } from './types/core';
import { Dimension } from './types/position'

export function get_colorize_by(): ColorizeBy {
  const elem = document.getElementsByClassName('colorize-by')[0] as HTMLElement
  if (elem.id.startsWith('party-dot')) {
    return {
      quantity: 'party',
      num: parseInt(elem.id.slice('party-dot-'.length))
    }
  }
  return {
    quantity: 'coalition',
    num: parseInt(elem.innerText)
  }
}

export function table_trs(table_id: string): Array<Element> {
  const table = document.getElementById(table_id)!
  const tbody = table.getElementsByTagName("tbody")[0]!;
  return Array.from(tbody.children)
}

/** Get the current canvas layout size, which depends on the current screen width
 *
 * The canvas "data" size is always 200x200, which exactly matches the number of
 * elections simulated. The docs says:
 *
 * > The [canvas] element can be sized arbitrarily by CSS, but during rendering
 * > the image is scaled to fit its layout size: if the CSS sizing doesn't
 * > respect the ratio of the initial canvas, it will appear distorted.
 *
 * So the "data" size of 200x200 is scaled by the browser the fit the CSS sizing,
 * which depends on the current screen width. Thus there is no problem in plotting
 * the data or setting its width and height attributes.
 *
 * However, dragging needs the actual canvas layout size, to calculate where
 * the pointer is on the grid, so this function has to be used
 * */
export function get_canvas_dimensions(): Dimension {
  const canvas = document.getElementsByTagName('canvas')[0]!
  return { width: canvas.clientWidth, height: canvas.clientHeight }
}

export function should_expand_points(): boolean {
  const checkbox = document.getElementById('expand-points') as HTMLInputElement
  return checkbox.checked
}

export function get_cmap_name(): string {
  const btn = document.getElementById('cmap_select_btn')!
  return btn.innerText
}

export function get_form_input(
  form: HTMLFormElement | null,
  name: string
): HTMLInputElement {
  if (!form) {
    form = document.getElementById("myform") as HTMLFormElement
  }
  return form.elements.namedItem(name) as HTMLInputElement
}

export function set_radio(radio_group: RadioNodeList, name: string): void {
  for (const radio of Array.from(radio_group)) {
    const r = radio as HTMLInputElement
    if (r.id === name) {
      r.checked = true
      break
    }
  }
}

function get_radio(radio_group: RadioNodeList): string | null {
  for (const radio of Array.from(radio_group)) {
    const r = radio as HTMLInputElement
    if (r.checked) {
      return r.id
    }
  }
  return null
}

export function get_method(form: HTMLFormElement | null): string {
  if (!form) {
    form = document.getElementById("myform") as HTMLFormElement
  }
  const radio_group = form.elements.namedItem('method') as RadioNodeList
  return get_radio(radio_group)!
}
