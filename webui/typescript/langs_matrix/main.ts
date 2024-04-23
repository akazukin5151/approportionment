import { Chart } from 'chart.js/auto';
import * as helpers from 'chart.js/helpers';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import * as d3_sc from 'd3-scale-chromatic';

Chart.register(MatrixController, MatrixElement);

interface Data {
    [cand1: string]: {
        [cand2: string]: number
    }
}

async function main() {
    const res = await fetch('matrix.json');
    const data = await res.json() as Data;

    const percentages: Data = {}
    let max_percentage = 0
    for (const [lang1, arr] of Object.entries(data)) {
        let lang1_sum = 0
        for (const value of Object.values(arr)) {
            lang1_sum += value
        }

        const col: { [cand2: string]: number } = {}
        for (const [lang2, value] of Object.entries(arr)) {
            const perc = value / lang1_sum * 100;
            col[lang2] = perc;
            if (perc > max_percentage) {
                max_percentage = perc;
            }
        }
        percentages[lang1] = col
    }

    const sorted = Object.keys(data).sort();
    const rev_sort = Array.from(sorted).reverse();

    const _chart = new Chart('matrix-chart', {
        type: 'matrix',
        data: {
            datasets: [{
                label: 'Relative',
                data: Object.entries(percentages).flatMap(
                    ([row_name, arr]) =>
                        Object.entries(arr)
                            .map(
                                ([col_name, v]) => (
                                    { x: col_name, y: row_name, v }
                                )
                            )
                ),
                backgroundColor: (context) => {
                    const d = context.dataset.data[context.dataIndex]!;
                    // typescript doesn't recognize the `v` attribute we just added.
                    // @ts-expect-error
                    const value: number = d.v;
                    return d3_sc.interpolateGreens(value / max_percentage)
                },
                // borderWidth: 1,
                // borderColor: 'gray',
                width: ({ chart }) => (chart.chartArea || {}).width / 42 - 1,
                height: ({ chart }) => (chart.chartArea || {}).height / 42 - 1,
            }]
        },
        options: {
            plugins: {
                // legend: false,
                tooltip: {
                    callbacks: {
                        title: (context) => {
                            const d = context[0]!.dataset.data[context[0]!.dataIndex]!;
                            // typescript doesn't recognize the `v` attribute we just added.
                            // @ts-expect-error
                            const value: number = d.v;
                            const vf = value.toFixed(2);
                            return `${vf}% of ${d.y} users also uses ${d.x}`
                        },
                        beforeBody: (context) => {
                            // data is a flat 1 dimensional array, so we can't neatly
                            // use it to get the opposite cell (other than iterating
                            // through all of them).
                            const d = context[0]!.dataset.data[context[0]!.dataIndex]!;
                            const value = percentages[d.x]![d.y]!.toFixed(2);
                            return `${value}% of ${d.x} users also uses ${d.y}`
                        },
                        label: () => ''
                    }
                }
            },
            scales: {
                x: {
                    type: 'category',
                    position: 'top',
                    labels: rev_sort,
                    // needs reverse: true here, but not for y axis.
                    reverse: true,
                    ticks: {
                        display: true
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    type: 'category',
                    labels: rev_sort,
                    offset: true,
                    ticks: {
                        display: true,
                    },
                    grid: {
                        display: false
                    }
                },
            }
        }
    })

    const table = document.getElementById('matrix') as HTMLTableElement;
    const header_row = document.createElement('tr')
    table.appendChild(header_row);

    // first column is for the other set of labels
    const th = document.createElement('th')
    th.innerText = '';
    header_row.appendChild(th);

    // fill the header
    for (const header of sorted) {
        const th = document.createElement('th')
        th.innerText = header;
        header_row.appendChild(th);
    }

    // total column
    {
        const th = document.createElement('th')
        th.innerText = 'Total';
        header_row.appendChild(th);
    }

    // add rows
    for (const row_name of sorted) {
        const tr = document.createElement('tr');
        const td = document.createElement('td')
        td.innerText = row_name
        tr.appendChild(td)

        // add cell for each col
        for (const col_name of sorted) {
            const td = document.createElement('td')
            const value = percentages[row_name]![col_name]?.toFixed(1) ?? ''
            td.innerText = value
            tr.appendChild(td)
        }

        // add total cell
        {
            const td = document.createElement('td')
            td.innerText = '100'
            tr.appendChild(td)
        }

        table.appendChild(tr)
    }

    const rel = document.getElementById('rel') as HTMLInputElement
    const abs = document.getElementById('abs') as HTMLInputElement
    rel.addEventListener('change', () => on_radio_change(table, sorted, percentages, x => x.toFixed(1)))

    abs.addEventListener('change', () => on_radio_change(table, sorted, data, x => x.toString()))
}


function on_radio_change(
    table: HTMLTableElement,
    sorted: string[],
    data: Data,
    to_string: (n: number) => string
) {
    let i = 0;
    // plus 1 for the first column
    const last_col_idx = sorted.length + 1

    for (const tr of table.children) {
        // skip the first row, which is the text header
        if (i === 0) {
            i += 1;
            continue;
        }

        let j = 0;
        let row_name = '';
        let row_sum = 0
        for (const td of tr.children) {
            const cell = td as HTMLElement;
            if (j === 0) {
                j += 1;
                row_name = cell.innerText;
                continue;
            }

            if (j === last_col_idx) {
                cell.innerText = to_string(row_sum);
                break;
            }

            const col_name = sorted[j - 1]!;
            if (col_name !== row_name) {
                const value = data[row_name]![col_name]!;
                if (value == null) {
                    debugger
                }
                cell.innerText = to_string(value) ?? '';
                row_sum += value
            }
            j += 1;
        }
    }
}

(async () => await main())()
