import * as rounds from '../rounds'

(async (): Promise<void> => {
  const height = 1000
  const y_axis_domain = (x: [string, number]): string => x[0]
  const spav_x_axis_domain =
    (_: Array<Map<string, number>>, r1_sorted: Array<[string, number]>): number =>
      r1_sorted[0]![1]
  const phragmen_x_axis_domain =
    (all_rounds: Array<Map<string, number>>, _: Array<[string, number]>): number => {
      const last_round = all_rounds[all_rounds.length - 1]!
      const cand_with_max = Array.from(last_round).reduce((a, b) => a[1] > b[1] ? a : b)
      return cand_with_max[1]
    }
  const get_y_value = (d: [string, number]): string => d[0]

  const run_spav = (filename: string): Promise<void> =>
    rounds.main(height, spav_x_axis_domain, y_axis_domain, get_y_value, filename)

  const run_phragmen = (filename: string): Promise<void> =>
    rounds.main(height, phragmen_x_axis_domain, y_axis_domain, get_y_value, filename)

  const spav = document.getElementById('SPAV') as HTMLInputElement
  const phragmen = document.getElementById('Phragmen') as HTMLInputElement

  spav.addEventListener('click', async () => await run_spav('SPAV.json'))
  phragmen.addEventListener('click', async () => await run_phragmen('Phragmen.json'))

  if (spav.checked) {
    await run_spav('SPAV.json')
  } else {
    await run_phragmen('Phragmen.json')
  }
})()