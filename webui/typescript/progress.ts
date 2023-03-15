export class ProgressBar {
  private container_elem: HTMLElement
  private fill_elem: HTMLElement

  constructor() {
    this.container_elem = document.getElementById('progress-bar')!
    this.fill_elem = this.container_elem.children[0] as HTMLElement
  }

  /** Set the progress bar's value to a number between 0 and 100 inclusive */
  set_percentage(percentage: number): void {
    this.container_elem.style.width = `${percentage}vw`
  }

  reset(): void {
    this.set_percentage(0)
  }

  start_indeterminate(): void {
    this.set_percentage(100)
    this.container_elem.style.backgroundImage = 'unset'
    this.fill_elem.style.display = 'initial'
  }

  stop_indeterminate(): void {
    this.container_elem.style.backgroundImage = 'initial'
    this.fill_elem.style.display = 'none'
  }

}
