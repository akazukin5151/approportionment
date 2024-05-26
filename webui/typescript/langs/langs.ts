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
  const diff_chart_height = 700

  const spav_shadow_settings = {
    shadow_every_round: true,
    shadow_on_top: false,
    shadow_color: 'gray'
  }

  const spav_x_label = "Total approvals";

  const run_spav = (filename: string): Promise<(e: KeyboardEvent) => void> =>
    rounds.main(height, diff_chart_height, spav_x_axis_domain, y_axis_domain, get_y_value, filename, false, spav_shadow_settings, spav_x_label, 'SPAV_metrics.json')

  const phragmen_shadow_settings = {
    shadow_every_round: true,
    shadow_on_top: true,
    shadow_color: '#f3f3f3'
  }

  const phragmen_x_label = "Total load";

  const run_phragmen = (filename: string): Promise<(e: KeyboardEvent) => void> =>
    rounds.main(height, diff_chart_height, phragmen_x_axis_domain, y_axis_domain, get_y_value, filename, true, phragmen_shadow_settings, phragmen_x_label, 'Phragmen_metrics.json')

  const spav = document.getElementById('SPAV') as HTMLInputElement
  const phragmen = document.getElementById('Phragmen') as HTMLInputElement

  let handler: ((e: KeyboardEvent) => void) | null = null
  spav.addEventListener('click', async () => {
    if (handler != null) {
      document.removeEventListener('keydown', handler)
    }
    handler = await run_spav('SPAV.json')
  })

  phragmen.addEventListener('click', async () => {
    if (handler != null) {
      document.removeEventListener('keydown', handler)
    }
    handler = await run_phragmen('Phragmen.json')
  })

  if (spav.checked) {
    handler = await run_spav('SPAV.json')
  } else {
    handler = await run_phragmen('Phragmen.json')
  }
})()
