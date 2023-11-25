import * as rounds from './rounds'

(async (): Promise<void> => {
  const height = 1000
  const y_axis_domain = (x: [string, number]): string => x[0]
  const get_y_value = (d: [string, number]): string => d[0]
  const main = (filename: string): Promise<void> => rounds.main(height, y_axis_domain, get_y_value, filename)

  const starpr = document.getElementById('StarPr')!
  const sss = document.getElementById('Sss') as HTMLInputElement
  const rrv = document.getElementById('Rrv') as HTMLInputElement

  starpr.addEventListener('click', async () => await main('StarPr.json'))
  sss.addEventListener('click', async () => await main('StarPr.json'))
  rrv.addEventListener('click', async () => await main('RRV.json'))

  if (rrv.checked) {
    await main('RRV.json')
  } else if (sss.checked) {
    await main('Sss.json')
  } else {
    await main('StarPr.json')
  }
})()
