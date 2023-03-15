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

  set_transition_duration(n_voters: number): void {
    // when n_voters == 100, duration is 0.1
    // when it is 1000, duration is 0.4
    // so let's just use a linear interpolation
    // gradient = (0.4 - 0.1) / (1000 - 100) = 1 / 3000
    // 0.1 = 1/3000 * 100 + y-intercept
    // y-intercept = 0.1 - 1/30 = 2/30

    // eslint-disable-next-line no-magic-numbers
    const duration = 1 / 3000 * n_voters + 2 / 30
    this.container_elem.style.transitionDuration = `${duration}s`
  }

}
