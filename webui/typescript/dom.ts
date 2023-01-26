export function remove_all_children(elem: HTMLElement): void {
  while (elem.lastChild) {
    elem.removeChild(elem.lastChild)
  }
}
