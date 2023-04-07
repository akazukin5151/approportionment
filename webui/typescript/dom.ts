export function remove_all_children(elem: HTMLElement): void {
  while (elem.lastChild) {
    elem.removeChild(elem.lastChild)
  }
}

export function show_error_dialog(e: Error): void {
  const code = document.getElementById('alert-msg')
  if (code) {
    code.innerText = e.message
    const alert_ = code.parentNode as HTMLElement
    const alert_container = alert_.parentNode as HTMLElement
    alert_container.classList.remove('display-none')
  }
}
