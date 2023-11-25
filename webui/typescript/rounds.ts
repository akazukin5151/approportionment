import * as d3 from 'd3'

interface Candidates {
  [candidate_name: string]: number;
}

type ElectionResult = {
  choices: Candidates,
  rounds: Array<Array<number>>
}

type Selection = d3.Selection<any, [string, number], SVGElement, [string, number]>

type Rect = d3.Selection<SVGElement, [string, number], any, [string, number]>

export async function main(
  height: number,
  x_axis_domain: (all_rounds: Array<Map<string, number>>, r1_sorted: Array<[string, number]>) => number,
  y_axis_domain: (candidate: [string, number]) => string,
  get_y_value: (candidate: [string, number]) => string,
  filename: string
): Promise<void> {
  // TODO: gracefully redraw to remove flash
  const chart = document.getElementById('chart')!
  while (chart.lastChild) {
    chart.removeChild(chart.lastChild)
  }

  const current_round = document.getElementById('current_round')!
  current_round.innerText = '1'
  const slider = document.getElementById('slider') as HTMLInputElement
  slider.value = '0'

  const langs = await fetch(filename)
  const json = await langs.json() as ElectionResult

  const idx_to_id: Map<number, string> = new Map()
  // for-in loop to loop over the fields
  for (const x in json.choices) {
    idx_to_id.set(json.choices[x]!, x)
  }

  const all_rounds = json.rounds.map(round => {
    const map: Map<string, number> = new Map()
    round.forEach((score, i) => {
      map.set(idx_to_id.get(i)!, score)
    })
    return map
  })

  const r1_sorted = Array.from(all_rounds[0]!).sort((a, b) => b[1] - a[1])

  // set the dimensions and margins of the graph
  const margin = { top: 30, right: 30, bottom: 70, left: 150 },
    width = 1200 - margin.left - margin.right,
    height_ = height - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height_ + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  const y = d3.scaleBand()
    .range([ 0, height_ ])
    .domain(r1_sorted.map(y_axis_domain))
    .padding(0.2);

  svg.append("g")
    .call(d3.axisLeft(y))

  const x = d3.scaleLinear()
    .domain([0, x_axis_domain(all_rounds, r1_sorted)])
    .range([0, width]);

  svg.append("g")
    .call(d3.axisTop(x));

  // Bars
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  function draw(data: Array<[string, number]>): Selection {
    return svg.selectAll("bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => y(get_y_value(d))!)
      .attr("height", y.bandwidth())
      .attr("width", d => x(d[1]))
  }

  draw(r1_sorted)
    .attr("fill", x => color(x[0]))
    .attr('class', 'rect')

  slider.max = (json.rounds.length - 1).toString()
  slider.oninput = (evt): void => {
    const target = evt.target as HTMLInputElement
    const round = parseInt(target.value)
    const did_round_increase = round + 1 > parseInt(current_round.innerText)
    current_round.innerText = (round + 1).toString()

    const selection = d3.selectAll(".rect") as Rect
    selection
      .transition()
      .attr("width", ([lang, prev_score], i) => {
        const new_score = all_rounds[round]!.get(lang)
        if (new_score == null || new_score === 0) {
          if (i === 0) {
            return x(prev_score)
          }
          for (let r = round - 1; r > 0; r--) {
            const s = all_rounds[r]!.get(lang)
            if (s != null && s !== 0) {
              return x(s)
            }
          }
          console.warn('null width')
          return null
        } else {
          return x(new_score)
        }
      })
      .attr("fill", ([lang, _prev_score], i) => {
        const new_score = all_rounds[round]!.get(lang)
        if (new_score == null || new_score === 0) {
          return 'none'
        } else {
          return d3.schemeCategory10[i % d3.schemeCategory10.length]!
        }
      })
      .attr("stroke", ([lang, _prev_score], _i) => {
        const new_score = all_rounds[round]!.get(lang)
        if (new_score == null || new_score === 0) {
          return 'red'
        } else {
          return 'none'
        }
      })

    svg.selectAll('.shadow').remove()

    if (did_round_increase) {
      const r: Array<[string, number]> = r1_sorted.map(x => {
        const lang = x[0]
        return [lang, all_rounds[round - 1]!.get(lang)!]
      })

      draw(r)
        .attr("fill", 'none')
        .attr('stroke', ([lang, _], _i) => {
          const new_score = all_rounds[round]!.get(lang)
          if (new_score == null || new_score === 0) {
            return 'none'
          } else {
            return 'gray'
          }
        })
        .attr('class', 'shadow')
    }
  }
}

