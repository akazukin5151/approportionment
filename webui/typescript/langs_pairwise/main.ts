import { Chart } from 'chart.js/auto';

interface Data {
    choices: { [choice: string]: number };
    changes: Array<Array<number>>;
}

async function main(filename: string) {
    const res = await fetch(filename);
    const data = await res.json() as Data;
    // console.log(data);

    const idx_to_choice: Map<number, string> = new Map();
    for (const [choice_name, choice_idx] of Object.entries(data.choices)) {
        idx_to_choice.set(choice_idx, choice_name)
    }

    const all_data: Map<string, Array<{ name: string, value: number }>> = new Map();
    data.changes.map((arr, choice_idx) => {
        const choice_name = idx_to_choice.get(choice_idx)!;
        const sorted = arr.map((v, i) => ({
            name: idx_to_choice.get(i)!,
            value: v,
        }))
            .sort((a, b) => b.value - a.value);

        // remove the first element, which will always be the choice_name with a value
        // of 1.
        all_data.set(choice_name, sorted.slice(1))
    })
    // console.log(all_data);

    const select = document.getElementById('winner-select') as HTMLSelectElement;

    const choice_names = Array.from(Object.keys(data.choices));
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

    const selected_choice = 'JavaScript';
    const selected_data = all_data.get(selected_choice)!;

    const ctx = document.getElementById("affinity-chart") as HTMLCanvasElement;
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: selected_data.map(x => x.name),
            datasets: [
                {
                    label: 'SPAV',
                    data: selected_data.map(x => x.value),
                }
            ]
        },
        options: {
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
                    }
                }
            }
        }
    });

    select.addEventListener('change', () => {
        const selected_opt = Array.from(select.children).find(
            option => (option as HTMLOptionElement).selected
        )! as HTMLOptionElement;

        const selected_choice = selected_opt.innerText;
        const selected_data = all_data.get(selected_choice)!;

        while (chart.data.datasets[0]!.data.pop() != null) {
            chart.data.labels!.pop();
        }

        selected_data.forEach((x, i) => {
            chart.data.datasets[0]!.data.push(x.value);
            chart.data.labels!.push(x.name);
        })
        // chart.data.datasets[0]!.data = selected_data.map(x => x.value);
        // chart.data.labels = selected_data.map(x => x.name);
        chart.update();
    })
}

(async () => await main('SPAV.json'))()