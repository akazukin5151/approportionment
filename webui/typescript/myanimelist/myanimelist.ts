import * as rounds from '../rounds'

type Anime = {
  title: string
}

interface AnimeData {
  [anime_id: string]: Anime
}

(async (): Promise<void> => {
  const height = 100000
  const x_axis_domain =
    (_: Array<Map<string, number>>, r1_sorted: Array<[string, number]>): number =>
      r1_sorted[0]![1]
  // for some reason, Array.from converts the keys of the map (which is int) into string
  const y_axis_domain = (x: [string, number]): string => anime_ids[parseInt(x[0])]!.title
  const get_y_value = (d: [string, number]): string => anime_ids[parseInt(d[0])]!.title
  const main = (filename: string): Promise<void> =>
    rounds.main(height, x_axis_domain, y_axis_domain, get_y_value, filename)

  const anime_data = await fetch('anime_data.json')
  const anime_ids = await anime_data.json() as AnimeData
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

