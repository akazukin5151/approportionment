interface Data {
    [cand1: string]: {
        [cand2: string]: number
    }
}

async function main() {
    const res = await fetch('matrix.json');
    const data = await res.json() as Data;

    const percentages: Data = {}
    for (const [lang1, arr] of Object.entries(data)) {
        let lang1_sum = 0
        for (const value of Object.values(arr)) {
            lang1_sum += value
        }

        const row: { [cand2: string]: number } = {}
        for (const [lang2, value] of Object.entries(arr)) {
            row[lang2] = value / lang1_sum * 100
        }
        percentages[lang1] = row
    }

    const sorted = Object.keys(data).sort();

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
