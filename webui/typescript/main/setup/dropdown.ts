import { computePosition } from "@floating-ui/dom"

export function toggle_dropdown(
  btn: HTMLElement,
  dropdown: HTMLElement,
  dropdown_id: string
): void {
  if (dropdown.style.display === 'none') {
    dropdown.style.display = 'flex'
    // this isn't needed for cmap_select but it doesn't interfere anyway
    computePosition(btn, dropdown).then(({ x, y }) => {
      dropdown.style.left = `${x}px`
      dropdown.style.top = `${y}px`
    })
    const listener =
      (e: Event): void => hide_dropdown(dropdown_id, btn, dropdown, listener, e)
    document.body.addEventListener('click', listener)
  } else {
    dropdown.style.display = 'none'
  }
}

export function hide_dropdown(
  dropdown_id: string,
  btn: HTMLElement,
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
  if (evt.target !== btn) {
    evt.preventDefault()
    dropdown.style.display = 'none'
    document.body.removeEventListener('click', listener)
  }
}

