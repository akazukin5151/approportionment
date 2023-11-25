import { autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom"


export function set_dropdown_position(btn: HTMLElement, dropdown: HTMLElement): void {
  autoUpdate(btn, dropdown, () => update_position(btn, dropdown))
}

function update_position(btn: HTMLElement, dropdown: HTMLElement): void {
  computePosition(btn, dropdown, {
    placement: 'bottom',
    middleware: [
      shift(),
      flip(),
      offset({
        mainAxis: 5,
        crossAxis: -30
      })
    ],
  }).then(({ x, y }) => {
    dropdown.style.left = `${x}px`
    dropdown.style.top = `${y}px`
  })
}
