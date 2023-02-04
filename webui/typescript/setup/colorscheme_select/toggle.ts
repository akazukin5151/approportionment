export function toggle_cmap_select(btn: HTMLElement): void {
  const dropdown = document.getElementById('cmap_select')!
  if (dropdown.style.display === 'none') {
    dropdown.style.display = 'flex'
    const listener = (e: Event): void => hide_dropdown(btn, dropdown, listener, e)
    document.body.addEventListener('click', listener)
  } else {
    dropdown.style.display = 'none'
  }
}

function hide_dropdown(
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
    if ('id' in p && p.id === 'cmap_select') {
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


