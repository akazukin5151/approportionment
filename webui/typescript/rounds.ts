import * as d3 from 'd3'
import { Chart as ChartJs } from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJs.register(annotationPlugin);

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

type Svg = d3.Selection<SVGGElement, Candidate, HTMLElement, any>

type Chart = {
  svg: Svg;
  axes: Axes;
  color: d3.ScaleOrdinal<string, string, never>;
  shadow_group: Svg;
  winner_stroke: Svg;
}

type Axes = {
  x: d3.ScaleLinear<number, number, never>;
  y: d3.ScaleBand<string>;
}

type DrawResult = d3.Selection<SVGRectElement, Candidate, SVGGElement, Candidate>

type Rect = d3.Selection<SVGElement, Candidate, any, Candidate>

type Transition = d3.Transition<SVGElement, Candidate, any, Candidate>

type ShadowSettings = {
  shadow_every_round: boolean,
  shadow_on_top: boolean,
  shadow_color: string,
}

type Metrics = Array<Metric>

type Metric = {
  average_utility: number,
  utility_q1: number,
  utility_q3: number,
  average_log_utility: number,
  average_at_least_1_winner: number,
  average_unsatisfied_utility: number,
  fully_satisfied_perc: number,
  totally_unsatisfied_perc: number,
  unsatisfied_perc: number,
  total_harmonic_quality: number,
  ebert_cost: number,
}

type NormalizedMetrics = Map<string, Array<number>>

type StatChart = ChartJs<"line", Array<number>, string>

export async function main(
  height: number,
  diff_chart_height: number,
  x_axis_domain: (all_rounds: Array<Map<string, number>>, r1_sorted: Array<Candidate>) => number,
  y_axis_domain: (candidate: Candidate) => string,
  get_y_value: (candidate: Candidate) => string,
  filename: string,
  reverse: boolean,
  shadow_settings: ShadowSettings,
  x_label: string,
  metrics_file: string | null,
): Promise<(e: KeyboardEvent) => void> {
  const diff: Array<[string, number, number]> = []

  let stat_chart: StatChart | null = null;
  if (metrics_file != null) {
    const metrics_json = await fetch(metrics_file)
    const metrics = await metrics_json.json() as Metrics
    const normed_metrics = normalize_metrics(metrics)

    stat_chart = draw_stats(metrics, normed_metrics)
  }

  const diff_chart = setup_diff_chart()
  const page = setup_buttons(diff_chart_height, y_axis_domain, get_y_value, diff, diff_chart, stat_chart)
  if (metrics_file == null) {
    page.open_diff_btn.style.display = 'none'
    page.diff_ui_container.style.display = 'none'
  }

  const current_round = document.getElementById('current_round')!
  const slider = document.getElementsByClassName('rounds-slider')[0] as HTMLInputElement
  slider.value = '0'

  // use arrow keys to adjust slider
  const handler = (e: KeyboardEvent): void => {
    if (e.target instanceof HTMLInputElement && e.target.className === 'rounds-slider') {
      return
    }

    let triggered = false;
    if (e.key === "ArrowLeft") {
      slider.value = (parseInt(slider.value) - 1).toString()
      triggered = true;
    } else if (e.key === "ArrowRight") {
      slider.value = (parseInt(slider.value) + 1).toString()
      triggered = true;
    }

    if (triggered) {
      const event = new Event('input')
      slider.dispatchEvent(event)
    }
  }

  document.addEventListener('keydown', handler)

  const setup = await setup_data(filename, reverse)

  const chart = setup_chart(height, x_axis_domain, y_axis_domain, setup, shadow_settings, x_label)

  draw("winner", chart.winner_stroke, chart.axes, get_y_value, setup.r1_sorted)
    .attr("fill", 'none')
    .attr('class', 'winner');

  draw("bar", chart.svg, chart.axes, get_y_value, setup.r1_sorted)
    .attr("fill", d => chart.color(d[0]))
    .attr('class', 'rect')
    .append('title')
    .text((d) => {
      const category_name = get_y_value(d)
      return `${category_name} - ${d[1]}`
    })
    .attr('class', 'title')

  const max_rounds = setup.n_rounds - 1
  slider.max = max_rounds.toString()
  current_round.innerText = `1 / ${max_rounds + 1}`;

  slider.oninput = (evt): void => on_round_change(
    page, setup, chart, diff, current_round, max_rounds + 1,
    diff_chart_height, y_axis_domain, get_y_value, evt,
    shadow_settings, stat_chart
  )

  if (metrics_file != null) {
    setup_resize_diff_ui(page)
  }

  return handler
}

function setup_diff_chart(): Element {
  const diff_chart = document.getElementsByClassName('rounds-diff-chart')![0]!

  // reset the charts (needed if radio changed)
  // TODO: gracefully redraw to remove flash
  const chart = document.getElementsByClassName('rounds-chart')![0]!
  while (chart.lastChild) {
    chart.removeChild(chart.lastChild)
  }

  while (diff_chart.lastChild) {
    diff_chart.removeChild(diff_chart.lastChild)
  }

  return diff_chart
}

function setup_buttons(
  diff_chart_height: number,
  y_axis_domain: (candidate: Candidate) => string,
  get_y_value: (candidate: Candidate) => string,
  diff: Array<[string, number, number]>,
  diff_chart: Element,
  stat_chart: StatChart | null
): Page {
  const open_diff_btn = document.getElementById('open-diff-btn')!
  const diff_ui_container = document.getElementById("diff-ui-container")!
  // we use onclick instead of addEventListener here to override any previous handlers.
  // this prevents a previous one (e.g, after switching between methods)
  // from closing the diff ui
  open_diff_btn.onclick = (): void => {
    if (diff_ui_container.style.display === 'none') {
      diff_ui_container.style.display = "block";
      if (diff.length === 0) {
        while (diff_chart.lastChild) {
          diff_chart.removeChild(diff_chart.lastChild)
        }
      } else {
        diff.sort((a, b) => a[2] - b[2])
        draw_diff_chart(diff_chart, y_axis_domain, get_y_value, diff, diff_chart_height)
      }

      if (stat_chart != null) {
        const current_round = document.getElementById('current_round')!
        // `${round + 1} / ${max_rounds}`;
        const r = current_round.innerText.split('/')[0]!
        // this ignores the trailing space
        const round = parseInt(r)
        update_stats(round - 1, stat_chart)
      }
    } else {
      diff_ui_container.style.display = "none";
    }
  }
  diff_ui_container.style.display = "none";
  return { open_diff_btn, diff_ui_container, diff_chart }
}

async function setup_data(filename: string, reverse: boolean): Promise<Setup> {
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

  if (reverse) {
    r1_sorted.reverse()
  }

  return {
    all_rounds,
    r1_sorted,
    n_rounds: json.rounds.length
  }
}

function setup_chart(
  height: number,
  x_axis_domain: (all_rounds: Array<Map<string, number>>, r1_sorted: Array<Candidate>) => number,
  y_axis_domain: (candidate: Candidate) => string,
  setup: Setup,
  shadow_settings: ShadowSettings,
  x_label: string
): Chart {
  // set the dimensions and margins of the graph
  const margin = { top: 60, right: 30, bottom: 70, left: 150 },
    width = 1200 - margin.left - margin.right,
    height_ = height - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3.select(".rounds-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height_ + margin.top + margin.bottom);

  const bottom = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")") as Svg;

  const top = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")") as Svg;

  const winner_stroke = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")") as Svg;

  const axes = setup_axes(height_, width, x_axis_domain, y_axis_domain, setup, top)

  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width * 0.7)
    .attr("y", 20)
    .text(x_label);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  return {
    svg: shadow_settings.shadow_on_top ? bottom : top,
    shadow_group: shadow_settings.shadow_on_top ? top : bottom,
    axes, color, winner_stroke
  }
}

function setup_axes(
  height_: number,
  width: number,
  x_axis_domain: (all_rounds: Array<Map<string, number>>, r1_sorted: Array<Candidate>) => number,
  y_axis_domain: (candidate: Candidate) => string,
  { all_rounds, r1_sorted }: Setup,
  svg: Svg
): Axes {
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

  return { x, y }
}

function draw(
  selector: string,
  svg: Svg,
  axes: Axes,
  get_y_value: (candidate: Candidate) => string,
  data: Array<Candidate>
): DrawResult {
  return svg.selectAll(selector)
    .data(data)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", d => axes.y(get_y_value(d))!)
    .attr("height", axes.y.bandwidth())
    .attr("width", d => axes.x(d[1]))
}

function draw_diff_chart(
  diff_chart: Element,
  y_axis_domain: (candidate: Candidate) => string,
  get_y_value: (candidate: Candidate) => string,
  diff: Array<[string, number, number]>,
  diff_chart_height: number,
): void {
  while (diff_chart.lastChild) {
    diff_chart.removeChild(diff_chart.lastChild)
  }

  // TODO: reduce height at later rounds
  const margin = { top: 50, right: 30, bottom: 70, left: 150 },
    width = 450 - margin.left - margin.right,
    height_ = diff_chart_height - margin.top - margin.bottom;

  const svg = d3.select(".rounds-diff-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height_ + margin.top + margin.bottom)

  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", margin.left + width * 0.7)
    .attr("y", 20)
    .text("Percentage change")
    .style('font-size', '14px');

  const chart = svg.append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  const y = d3.scaleBand()
    .range([height_, 0])
    .domain(diff.map(x => y_axis_domain([x[0], x[1]])))
    .padding(0.2);

  chart.append("g")
    .call(d3.axisLeft(y))

  const x = d3.scaleLinear()
    .domain([0, 1])
    .range([0, width]);

  chart.append("g")
    .call(d3.axisTop(x));

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  chart.selectAll("diff_bar")
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
  max_rounds: number,
  diff_chart_height: number,
  y_axis_domain: (candidate: Candidate) => string,
  get_y_value: (candidate: Candidate) => string,
  evt: Event,
  shadow_settings: ShadowSettings,
  stat_chart: StatChart | null,
): void {
  diff.length = 0;
  const target = evt.target as HTMLInputElement;
  const round = parseInt(target.value);
  current_round.innerText = `${round + 1} / ${max_rounds}`;

  const selection = d3.selectAll(".rect") as Rect;
  const transition = selection.transition();
  add_width_transition(transition, setup, chart, diff, round)
  add_fill_transition(transition, setup, round)

  add_winner_stroke(setup, chart, diff, round)
  handle_shadow(chart, setup, round, get_y_value, shadow_settings)

  d3.selectAll('.title').remove()

  selection
    .append('title')
    .text((d) => {
      const c = setup.all_rounds[round]?.get(d[0])
      const category_name = get_y_value(d)
      return `${category_name} - ${c}`
    })
    .attr('class', 'title')

  if (page.diff_ui_container.style.display === "block") {
    if (round === 0) {
      while (page.diff_chart.lastChild) {
        page.diff_chart.removeChild(page.diff_chart.lastChild)
      }
    } else {
      diff.sort((a, b) => a[2] - b[2])
      draw_diff_chart(page.diff_chart, y_axis_domain, get_y_value, diff, diff_chart_height)
    }

    if (stat_chart != null) {
      update_stats(round, stat_chart)
    }
  }

  if (stat_chart == null) {
    if (round === 0) {
      page.open_diff_btn.style.display = 'none'
      page.diff_ui_container.style.display = 'none'
    } else {
      page.open_diff_btn.style.display = 'block'
    }
  }
}

function add_width_transition(
  transition: Transition,
  setup: Setup,
  chart: Chart,
  diff: Array<[string, number, number]>,
  round: number
): void {
  transition
    .attr("width", ([lang, initial], i) => {
      const new_score = setup.all_rounds[round]!.get(lang);
      if (new_score == null || new_score === 0) {
        if (i === 0) {
          return chart.axes.x(initial);
        }
        for (let r = round - 1; r > 0; r--) {
          const s = setup.all_rounds[r]!.get(lang);
          if (s != null && s !== 0) {
            return chart.axes.x(s);
          }
        }
        console.warn('null width');
        return null;
      } else {
        const prev_score = round !== 0 ? setup.all_rounds[round - 1]!.get(lang)! : 0;
        const d = prev_score - new_score;
        if (d > 0) {
          // percentage decrease
          diff.push([lang, d, 1 - (new_score / prev_score)]);
        } else if (d !== 0) {
          // percentage increase
          diff.push([lang, d, (new_score - prev_score) / prev_score]);
        }
        return chart.axes.x(new_score);
      }
    })

}

function add_fill_transition(
  transition: Transition,
  setup: Setup,
  round: number
): void {
  transition
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

}

function add_winner_stroke(
  setup: Setup,
  chart: Chart,
  diff: Array<[string, number, number]>,
  round: number
): void {
  const winner_selection = d3.selectAll(".winner") as Rect;
  const winner_transition = winner_selection.transition();

  add_width_transition(winner_transition, setup, chart, diff, round)

  winner_transition
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
}

function handle_shadow(
  chart: Chart,
  setup: Setup,
  round: number,
  get_y_value: (candidate: Candidate) => string,
  shadow_settings: ShadowSettings,
): void {
  chart.shadow_group.selectAll('.shadow').remove();

  let cur_round = round;
  while (cur_round > 0) {
    const r: Array<Candidate> = setup.r1_sorted.map(x => {
      const lang = x[0];
      return [lang, setup.all_rounds[cur_round - 1]!.get(lang)!];
    });

    draw("shadow", chart.shadow_group, chart.axes, get_y_value, r)
      .attr('fill', 'none')
      .attr('stroke', ([lang, _], _i) => {
        const new_score = setup.all_rounds[cur_round]!.get(lang);
        const prev_score = setup.all_rounds[cur_round - 1]!.get(lang);
        if (new_score == null || new_score === 0 || new_score === prev_score) {
          return 'none';
        } else {
          return shadow_settings.shadow_color;
        }
      })
      .attr('class', 'shadow');

    if (!shadow_settings.shadow_every_round) {
      break
    }
    cur_round -= 1;
  }
}

function normalize_metrics(metrics: Metrics): NormalizedMetrics {
  let min_utility = 0
  let max_utility = 0

  const res = Object.keys(metrics[0]!).map((metric_name): [string, Array<number>] => {
    const m_n = metric_name as keyof Metric

    const min = metrics.map(m => m[m_n]).reduce((m1, m2) => m1 < m2 ? m1 : m2)
    const max = metrics.map(m => m[m_n]).reduce((m1, m2) => m1 > m2 ? m1 : m2)

    if (m_n === 'utility_q1') {
      min_utility = min
    }
    if (m_n === 'utility_q3') {
      max_utility = max
    }

    const normed = metrics.map(m => {
      const metric_value = m[m_n]!;
      return (metric_value - min) / (max - min)
    })

    return [metric_name, normed]
  })

  const map = new Map(res)

  // Normalize so that max upper error is 1, min lower error is 0. Don't use mean to normalize.
  const average_utility = metrics.map(m => (m.average_utility - min_utility) / (max_utility - min_utility))
  const utility_q1 = metrics.map(m => (m.utility_q1 - min_utility) / (max_utility - min_utility))
  const utility_q3 = metrics.map(m => (m.utility_q3 - min_utility) / (max_utility - min_utility))

  map.set('average_utility', average_utility)
  map.set('utility_q1', utility_q1)
  map.set('utility_q3', utility_q3)

  return map
}

// default chart.js colors
const BORDER_COLORS = [
  'rgb(54, 162, 235)', // blue
  'rgb(255, 99, 132)', // red
  'rgb(255, 159, 64)', // orange
  'rgb(255, 205, 86)', // yellow
  'rgb(75, 192, 192)', // green
  'rgb(153, 102, 255)', // purple
  'rgb(201, 203, 207)' // grey
];

// Border colors with 50% transparency
const BACKGROUND_COLORS = /* #__PURE__ */ BORDER_COLORS.map(color => color.replace('rgb(', 'rgba(').replace(')', ', 0.5)'));


function getBorderColor(i: number): string {
  return BORDER_COLORS[i % BORDER_COLORS.length]!;
}

function getBackgroundColor(i: number): string {
  return BACKGROUND_COLORS[i % BACKGROUND_COLORS.length]!;
}

function draw_stats(metrics: Metrics, normed_metrics: NormalizedMetrics): StatChart {
  const container = document.getElementById("stats-chart-container")!;
  while (container.lastChild) {
    container.removeChild(container.lastChild)
  }

  const ctx = document.createElement('canvas');
  ctx.id = "stats-chart"
  container.appendChild(ctx);

  const initial_visible = [
    'average_utility',
    'utility_q1',
    'utility_q3',
    'average_unsatisfied_utility',
    'ebert_cost'
  ]

  return new ChartJs(ctx, {
    type: 'line',
    data: {
      labels: metrics.map((_, round_idx) => (round_idx + 1).toString()),
      datasets: Array.from(normed_metrics.entries()).map(([k, v], i) => {
        // utility and its confidence interval should use the first default color.
        // they are the first 3 items hence the 0th color index.
        // the other colors would use the `i - 2`th default color
        const color_idx: number = i <= 2 ? 0 : i - 2;
        return {
          label: k,
          data: v,
          hidden: !initial_visible.includes(k),
          fill: k === 'utility_q3' ? 1 : k === 'average utility' ? 2 : false,
          backgroundColor: getBackgroundColor(color_idx),
          borderColor: getBorderColor(color_idx),
        }
      })
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        annotation: {
          annotations: [{
            'type': 'line',
            borderColor: 'black',
            borderWidth: 2,
            scaleID: 'x',
            value: 0
          }]
        }
      }
    }
  });
}

function update_stats(round: number, stat_chart: StatChart): void {
  // typescript doesn't understand that `annotations` is an array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ann = stat_chart.options.plugins!.annotation!.annotations! as any
  ann[0].value = round;
  stat_chart.update()
}

function setup_resize_diff_ui(page: Page): void {
  const resize_btn = document.getElementById('resize-btn') as HTMLButtonElement;
  const div_right_offset = 24;
  const div_bottom_offset = 205;

  let is_resizing = false;

  function resize_div(event: MouseEvent): void {
    if (is_resizing) {
      const width = window.screen.width - event.clientX - div_right_offset
      const height = window.screen.height - event.clientY - div_bottom_offset
      page.diff_ui_container.style.width = `${width}px`
      page.diff_ui_container.style.height = `${height}px`
    }
  }

  function end_resize(): void {
    is_resizing = false;
    resize_btn.style.backgroundColor = '#9c9c9c';
    resize_btn.style.filter = '';
    document.body.removeEventListener('mouseup', end_resize)
    document.body.removeEventListener('mouseleave', end_resize)
    document.body.removeEventListener('mousemove', resize_div)
  }

  document.body.addEventListener('mousedown', (event: MouseEvent) => {
    if (event.target === resize_btn) {
      is_resizing = true;

      resize_btn.style.backgroundColor = '#c96f6f';
      // ensure that the hover filter from simplecss is active even when the mouse
      // is in the nav header
      resize_btn.style.filter = 'brightness(1.4)';

      document.body.addEventListener('mousemove', resize_div)
      document.body.addEventListener('mouseup', end_resize)
      document.body.addEventListener('mouseleave', end_resize)
    }
  })
}
