export function abstract_on_drag_start(
  event: Event,
  listener: (e: Event) => void,
  clear_dragging: () => void,
): void {
  event.target!.addEventListener('mousemove', listener)
  event.target!.addEventListener('mouseup', (evt) => {
    evt.target!.removeEventListener('mousemove', listener)
    clear_dragging()
    if (document.body.style.cursor === 'grabbing') {
      document.body.style.cursor = 'grab'
    }
  })
}

export function abstract_on_drag_move<T>(
  event: Event,
  update_dragging: (e: MouseEvent) => void,
  get_dragging: () => T | null,
  run: (e: MouseEvent) => void
): void {
  if (get_dragging() === null) {
    update_dragging(event as MouseEvent)
  }

  if (get_dragging() !== null) {
    run(event as MouseEvent)
  }
}

