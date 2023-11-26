import * as d3 from 'd3'

interface Choices {
  [candidate_name: string]: number;
}

type ElectionResult = {
  choices: Choices,
  rounds: Array<Array<number>>
}

type Candidate = [string, number]

type Setup = {
  all_rounds: Array<Map<string, number>>;
  r1_sorted: Array<Candidate>;
  n_rounds: number
}

type Page = {
  open_diff_btn: HTMLElement;
  diff_ui_container: HTMLElement;
  diff_chart: Element;
}

type Chart = {
  svg: Selection;
  x: d3.ScaleLinear<number, number, never>;
  y: d3.ScaleBand<string>;
  color: d3.ScaleOrdinal<string, string, never>;
}

type Selection = d3.Selection<SVGGElement, Candidate, HTMLElement, any>

type DrawResult = d3.Selection<SVGRectElement, Candidate, SVGGElement, Candidate>

type Rect = d3.Selection<SVGElement, Candidate, any, Candidate>

export async function main(
  height: number,
  diff_chart_height: number,
  x_axis_domain: (all_rounds: Array<Map<string, number>>, r1_sorted: Array<Candidate>) => number,
  y_axis_domain: (candidate: Candidate) => string,
  get_y_value: (candidate: Candidate) => string,
  filename: string
): Promise<void> {
  const diff: Array<[string, number, number]> = []

  const page = setup_page(diff_chart_height, y_axis_domain, get_y_value, diff)

  const current_round = document.getElementById('current_round')!
  current_round.innerText = '1'
  const slider = document.getElementsByClassName('rounds-slider')[0] as HTMLInputElement
  slider.value = '0'

  const setup = await setup_data(filename)

  const chart = setup_chart(height, x_axis_domain, y_axis_domain, setup)

  draw(chart, get_y_value, setup.r1_sorted)
    .attr("fill", d => chart.color(d[0]))
    .attr('class', 'rect')

  slider.max = (setup.n_rounds - 1).toString()

  slider.oninput = (evt): void => on_round_change(
    page, setup, chart, diff, current_round,
    diff_chart_height, y_axis_domain, get_y_value, evt
  )
}

async function setup_data(filename: string): Promise<Setup> {
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

  return {
    all_rounds,
    r1_sorted,
    n_rounds: json.rounds.length
  }
}

function draw(
  { svg, x, y }: Chart,
  get_y_value: (candidate: Candidate) => string,
  data: Array<Candidate>
): DrawResult {
  return svg.selectAll("bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", d => y(get_y_value(d))!)
    .attr("height", y.bandwidth())
    .attr("width", d => x(d[1]))
}

function setup_page(
  diff_chart_height: number,
  y_axis_domain: (candidate: Candidate) => string,
  get_y_value: (candidate: Candidate) => string,
  diff: Array<[string, number, number]>
): Page {
  const diff_chart = document.getElementsByClassName('rounds-diff-chart')![0]!

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

  while (diff_chart.lastChild) {
    diff_chart.removeChild(diff_chart.lastChild)
  }
  open_diff_btn.style.display = 'none'
  diff_ui_container.style.display = "none";

  return { open_diff_btn, diff_ui_container, diff_chart }
}

function setup_chart(
  height: number,
  x_axis_domain: (all_rounds: Array<Map<string, number>>, r1_sorted: Array<Candidate>) => number,
  y_axis_domain: (candidate: Candidate) => string,
  { all_rounds, r1_sorted }: Setup
): Chart {
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
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")") as Selection;

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

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  return {
    svg, x, y, color
  }
}

function draw_diff_chart(
  diff_chart: Element,
  y_axis_domain: (candidate: Candidate) => string,
  get_y_value: (candidate: Candidate) => string,
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

function on_round_change(
  page: Page,
  setup: Setup,
  chart: Chart,
  diff: Array<[string, number, number]>,
  current_round: HTMLElement,
  diff_chart_height: number,
  y_axis_domain: (candidate: Candidate) => string,
  get_y_value: (candidate: Candidate) => string,
  evt: Event
): void {
  diff.length = 0;
  const target = evt.target as HTMLInputElement;
  const round = parseInt(target.value);
  const did_round_increase = round + 1 > parseInt(current_round.innerText);
  current_round.innerText = (round + 1).toString();

  if (round >= 1) {
    page.open_diff_btn.style.display = 'block';
  } else {
    page.open_diff_btn.style.display = 'none';
  }

  const selection = d3.selectAll(".rect") as Rect;
  selection
    .transition()
    .attr("width", ([lang, initial], i) => {
      const new_score = setup.all_rounds[round]!.get(lang);
      if (new_score == null || new_score === 0) {
        if (i === 0) {
          return chart.x(initial);
        }
        for (let r = round - 1; r > 0; r--) {
          const s = setup.all_rounds[r]!.get(lang);
          if (s != null && s !== 0) {
            return chart.x(s);
          }
        }
        console.warn('null width');
        return null;
      } else {
        const prev_score = round !== 0 ? setup.all_rounds[round - 1]!.get(lang)! : 0;
        const d = prev_score - new_score;
        diff.push([lang, d, new_score / prev_score]);
        return chart.x(new_score);
      }
    })
    .attr("fill", ([lang, _], i) => {
      const new_score = setup.all_rounds[round]!.get(lang);
      if (round !== 0) {
        const prev_score = setup.all_rounds[round - 1]!.get(lang);
        if (round > 0 && (new_score == null || new_score === 0 || new_score === prev_score)) {
          return 'none';
        }
      }
      return d3.schemeCategory10[i % d3.schemeCategory10.length]!;
    })
    .attr("stroke", ([lang, _], _i) => {
      const new_score = setup.all_rounds[round]!.get(lang);
      if (round !== 0) {
        const prev_score = setup.all_rounds[round - 1]!.get(lang);
        if (round > 0 && (new_score == null || new_score === 0 || new_score === prev_score)) {
          return 'red';
        }
      }
      return 'none';
    });

  chart.svg.selectAll('.shadow').remove();

  if (did_round_increase) {
    const r: Array<Candidate> = setup.r1_sorted.map(x => {
      const lang = x[0];
      return [lang, setup.all_rounds[round - 1]!.get(lang)!];
    });

    draw(chart, get_y_value, r)
      .attr("fill", 'none')
      .attr('stroke', ([lang, _], _i) => {
        const new_score = setup.all_rounds[round]!.get(lang);
        const prev_score = setup.all_rounds[round - 1]!.get(lang);
        if (new_score == null || new_score === 0 || new_score === prev_score) {
          return 'none';
        } else {
          return 'gray';
        }
      })
      .attr('class', 'shadow');
  }

  if (page.diff_ui_container.style.display === "block") {
    diff.sort((a, b) => a[2] - b[2]);
    draw_diff_chart(page.diff_chart, y_axis_domain, get_y_value, diff, diff_chart_height);
  }
}

