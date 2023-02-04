export function add_scroll_buttons(dropdown: HTMLElement): void {
  const div = document.createElement('div')
  div.className = 'scroll-indicator'
  const labels = ['D', 'C', 'B', 'P']
  for (let i = 0; i < labels.length; i++) {
    const btn = document.createElement('button')
    btn.innerText = labels[i]!
    btn.className = 'scroll-btn'
    btn.onclick = (): void => {
      const elem = document.getElementsByClassName('cmap-label')[i] as HTMLElement
      const pos = elem.offsetTop
      dropdown.scrollTop = pos
    }
    div.appendChild(btn)
  }
  dropdown.appendChild(div)
}

