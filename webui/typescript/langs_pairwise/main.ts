import { Chart, TooltipItem } from 'chart.js/auto';

interface Data {
    choices: { [choice: string]: number };
    changes: Array<Array<number>>;
}

type Row = { name: string, value: number }

/**
 * Data for an electoral method
 */
type EmData = Map<string, Array<Row>>

type AllEmData = Map<string, EmData>;

type Info = {
    method: string,
    label: string,
    axis: string,
    relative: boolean,
    dp: 'short' | 'long'
}

function short_percentage_label(context: TooltipItem<'bar'>): string {
    return context.parsed.x.toFixed(2) + '%';
}

function long_percentage_label(context: TooltipItem<'bar'>): string {
    return context.parsed.x.toFixed(6) + '%';
}

async function main(filenames: Array<string>) {
    const all_em_data: AllEmData = new Map();
    let choice_names: Array<string> = [];
    for (const filename of filenames) {
        const res = await fetch(filename);
        const data = await res.json() as Data;
        // console.log(data);

        if (choice_names.length === 0) {
            choice_names = Array.from(Object.keys(data.choices));
        }

        const idx_to_choice: Map<number, string> = new Map();
        for (const [choice_name, choice_idx] of Object.entries(data.choices)) {
            idx_to_choice.set(choice_idx, choice_name)
        }

        const em_data: EmData = new Map();
        data.changes.map((arr, choice_idx) => {
            const choice_name = idx_to_choice.get(choice_idx)!;
            const sorted = arr.map((v, i) => ({
                name: idx_to_choice.get(i)!,
                value: v,
            }))
                .sort((a, b) => b.value - a.value);

            // remove the first element, which will always be the choice_name with a value
            // of 1.
            em_data.set(choice_name, sorted.slice(1))
        })

        all_em_data.set(filename, em_data)
    }

    const select = document.getElementById('winner-select') as HTMLSelectElement;

    choice_names.sort();
    choice_names.forEach((choice, idx) => {
        const option = document.createElement('option');
        option.value = idx.toString();
        option.innerText = choice;
        if (choice == "JavaScript") {
            option.selected = true;
        }
        select.appendChild(option);
    });

    const initial_lang = 'JavaScript';
    const initial_data = all_em_data.get('SPAV-r.json')!.get(initial_lang)!;

    const ctx = document.getElementById("affinity-chart") as HTMLCanvasElement;
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: initial_data.map(x => x.name),
            datasets: [
                {
                    label: 'SPAV relative',
                    data: initial_data.map(x => x.value),
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            indexAxis: 'y',
            layout: {
                padding: {
                    left: 40,
                    right: 40,
                }
            },
            scales: {
                x: {
                    position: 'top',
                    title: {
                        text: 'Percentage change in total approvals',
                        display: true,
                    },
                    ticks: {
                        callback: (value) => value + '%'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: short_percentage_label
                    }
                }
            }
        }
    });

    const spav_r = document.getElementById('spav-r') as HTMLInputElement;
    const spav_a = document.getElementById('spav-a') as HTMLInputElement;
    const phragmen_a = document.getElementById('phragmen-a') as HTMLInputElement;
    const phragmen_r = document.getElementById('phragmen-r') as HTMLInputElement;
    const phragmen_m_r = document.getElementById('phragmen-m-r') as HTMLInputElement;
    const phragmen_m_a = document.getElementById('phragmen-m-a') as HTMLInputElement;

    const infos = [
        {
            radio: spav_r,
            method: 'SPAV-r.json',
            label: 'SPAV relative',
            axis: 'Percentage change in total approvals',
            relative: true,
            dp: 'short' as const,
        },
        {
            radio: spav_a,
            method: 'SPAV-a.json',
            label: 'SPAV absolute',
            axis: 'Change in total approvals',
            relative: false,
            dp: 'short' as const,
        },
        {
            radio: phragmen_m_r,
            method: 'Phragmen-m-r.json',
            label: 'Phragmen money relative',
            axis: 'Percentage change in total money',
            relative: true,
            dp: 'short' as const,
        },
        {
            radio: phragmen_m_a,
            method: 'Phragmen-m-a.json',
            label: 'Phragmen money absolute',
            axis: 'Change in total money',
            relative: false,
            dp: 'short' as const,
        },
        {
            radio: phragmen_a,
            method: 'Phragmen-a.json',
            label: 'Phragmen absolute',
            axis: 'Change in total loads',
            relative: false,
            dp: 'short' as const,
        },
        {
            radio: phragmen_r,
            method: 'Phragmen-r.json',
            label: 'Phragmen relative',
            axis: 'Percentage change in total loads',
            relative: true,
            dp: 'long' as const,
        }
    ];

    select.addEventListener(
        'change', () => {
            const info = infos.find(info => info.radio.checked)!
            change_dataset(select, chart, info, all_em_data)
        }
    )

    for (const info of infos) {
        info.radio.addEventListener(
            'change', () => change_dataset(select, chart, info, all_em_data)
        )
    }
}

function change_dataset(
    select: HTMLSelectElement,
    chart: Chart<"bar", number[], string>,
    info: Info,
    all_data_: AllEmData
) {
    const selected_opt = Array.from(select.children).find(
        option => (option as HTMLOptionElement).selected
    )! as HTMLOptionElement;

    while (chart.data.datasets[0]!.data.pop() != null) {
        chart.data.labels!.pop();
    }

    const map = all_data_.get(info.method)!;
    const selected_choice = selected_opt.innerText;
    const selected_data = map.get(selected_choice)!;

    selected_data.forEach((x) => {
        chart.data.datasets[0]!.data.push(x.value);
        chart.data.labels!.push(x.name);
    });

    chart.data.datasets[0]!.label = info.label;
    chart.options.scales!['x']!.title!.text = info.axis;

    chart.options.scales!['x']!.ticks!.callback =
        info.relative
            ? (value) => value + '%'
            : (value) => value

    chart.options.plugins!.tooltip!.callbacks!.label =
        info.relative
            ? info.dp === 'short' ? short_percentage_label : long_percentage_label
            : (context) => context.parsed.x.toFixed(2)

    chart.update();
}

(async () => {
    await main([
        'SPAV-r.json', 'SPAV-a.json', 'Phragmen-m-r.json', 'Phragmen-m-a.json',
        'Phragmen-r.json',
        'Phragmen-a.json',
    ])
})()
