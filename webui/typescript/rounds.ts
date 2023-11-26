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
  diff_chart_height: number,
  x_axis_domain: (all_rounds: Array<Map<string, number>>, r1_sorted: Array<[string, number]>) => number,
  y_axis_domain: (candidate: [string, number]) => string,
  get_y_value: (candidate: [string, number]) => string,
  filename: string
): Promise<void> {
  const diff: Array<[string, number, number]> = []

  const open_diff_btn = document.getElementById('open-diff-btn')!
  const diff_ui_container = document.getElementById("diff-ui-container")!
  open_diff_btn.addEventListener('click', () => {
    diff_ui_container.style.display = "block";
    diff.sort((a, b) => a[2] - b[2])
    draw_diff_chart(diff_chart, y_axis_domain, get_y_value, diff, diff_chart_height)
  })
  document.getElementById('close-diff-btn')!.addEventListener('click', () => {
    diff_ui_container.style.display = "none";
  })

  // TODO: gracefully redraw to remove flash
  const chart = document.getElementsByClassName('rounds-chart')![0]!
  while (chart.lastChild) {
    chart.removeChild(chart.lastChild)
  }

  const diff_chart = document.getElementsByClassName('rounds-diff-chart')![0]!
  while (diff_chart.lastChild) {
    diff_chart.removeChild(diff_chart.lastChild)
  }
  open_diff_btn.style.display = 'none'
  diff_ui_container.style.display = "none";

  const current_round = document.getElementById('current_round')!
  current_round.innerText = '1'
  const slider = document.getElementsByClassName('rounds-slider')[0] as HTMLInputElement
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
  const svg = d3.select(".rounds-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height_ + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  const y = d3.scaleBand()
    .range([0, height_])
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
    diff.length = 0
    const target = evt.target as HTMLInputElement
    const round = parseInt(target.value)
    const did_round_increase = round + 1 > parseInt(current_round.innerText)
    current_round.innerText = (round + 1).toString()

    if (round >= 1) {
      open_diff_btn.style.display = 'block'
    } else {
      open_diff_btn.style.display = 'none'
    }

    const selection = d3.selectAll(".rect") as Rect
    selection
      .transition()
      .attr("width", ([lang, initial], i) => {
        const new_score = all_rounds[round]!.get(lang)
        if (new_score == null || new_score === 0) {
          if (i === 0) {
            return x(initial)
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
          const prev_score = round !== 0 ? all_rounds[round - 1]!.get(lang)! : 0
          const d = prev_score - new_score
          diff.push([lang, d, new_score / prev_score])
          return x(new_score)
        }
      })
      .attr("fill", ([lang, _], i) => {
        const new_score = all_rounds[round]!.get(lang)
        if (round !== 0) {
          const prev_score = all_rounds[round - 1]!.get(lang)
          if (round > 0 && (new_score == null || new_score === 0 || new_score === prev_score)) {
            return 'none'
          }
        }
        return d3.schemeCategory10[i % d3.schemeCategory10.length]!
      })
      .attr("stroke", ([lang, _], _i) => {
        const new_score = all_rounds[round]!.get(lang)
        if (round !== 0) {
          const prev_score = all_rounds[round - 1]!.get(lang)
          if (round > 0 && (new_score == null || new_score === 0 || new_score === prev_score)) {
            return 'red'
          }
        }
        return 'none'
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
          const prev_score = all_rounds[round - 1]!.get(lang)
          if (new_score == null || new_score === 0 || new_score === prev_score) {
            return 'none'
          } else {
            return 'gray'
          }
        })
        .attr('class', 'shadow')
    }

    if (diff_ui_container.style.display === "block") {
      diff.sort((a, b) => a[2] - b[2])
      draw_diff_chart(diff_chart, y_axis_domain, get_y_value, diff, diff_chart_height)
    }
  }
}

function draw_diff_chart(
  diff_chart: Element,
  y_axis_domain: (candidate: [string, number]) => string,
  get_y_value: (candidate: [string, number]) => string,
  diff: Array<[string, number, number]>,
  diff_chart_height: number
): void {
  while (diff_chart.lastChild) {
    diff_chart.removeChild(diff_chart.lastChild)
  }

  // TODO: reduce height at later rounds
  const margin = { top: 30, right: 30, bottom: 70, left: 150 },
    width = 450 - margin.left - margin.right,
    height_ = diff_chart_height - margin.top - margin.bottom;

  const svg = d3.select(".rounds-diff-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height_ + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  const y = d3.scaleBand()
    .range([0, height_])
    .domain(diff.map(x => y_axis_domain([x[0], x[1]])))
    .padding(0.2);

  svg.append("g")
    .call(d3.axisLeft(y))

  const x = d3.scaleLinear()
    .domain([0, 1])
    .range([0, width]);

  svg.append("g")
    .call(d3.axisTop(x));

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  svg.selectAll("diff_bar")
    .data(diff)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", d => y(get_y_value([d[0], d[1]]))!)
    .attr("height", y.bandwidth())
    .attr("width", d => x(d[2]))
    .attr("fill", x => color(x[0]))
    .attr('class', 'diff_rect')
}
