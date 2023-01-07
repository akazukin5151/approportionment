export function setup_coalition_table() {
  const add_btn = document.getElementById('add-coalition-btn')! as HTMLElement;
  add_btn.onclick = () => {
    const table = document.getElementById('coalition-table')!;
    const tbody = table.children[0];

    const row = document.createElement('tr')

    const name_td = document.createElement('td')
    const max_num = Array.from(tbody.children)
      .slice(1)
      .map(row => row.children[0])
      .reduce((acc, x) => {
        const n = parseInt(x.innerHTML)
        if (n > acc) {
          return n
        }
        return acc
      }, 0)
    const num = max_num + 1
    name_td.appendChild(document.createTextNode(num.toString()))
    row.appendChild(name_td)

    const seats_td = document.createElement('td')
    seats_td.appendChild(document.createTextNode('0'))
    row.appendChild(seats_td)

    const btn_td = document.createElement('td')
    const delete_btn = document.createElement('button')
    delete_btn.innerText = 'Delete'
    delete_btn.onclick = delete_coalition
    btn_td.appendChild(delete_btn)
    row.appendChild(btn_td)

    tbody.appendChild(row)

    const selects = document.getElementsByClassName('select-coalition')!;
    for (const select of selects) {
      const option = document.createElement('option')
      option.value = num.toString()
      option.text = num.toString()
      select.appendChild(option)
    }
  }
}

function delete_coalition(ev: MouseEvent) {
  const e = ev.target
  if (e) {
    const btn_td = (e as Element).parentNode as Element
    const tr = btn_td.parentNode as Element
    const num = (tr.children[0] as HTMLElement).innerText
    const selects = document.getElementsByClassName('select-coalition')!;
    for (const select of selects) {
      const options = (select as HTMLSelectElement).options
      Array.from(options)
        .filter(option => option.text === num)
        .map(option => option.remove())
    }
    tr.remove()
  }
}

export function calculate_coalition_seats(coalition_num: string) {
  let total = 0
  const selects = document.getElementsByClassName('select-coalition')!;
  for (const select of selects) {
    const coalition = (select as HTMLSelectElement).selectedOptions[0]
    if (coalition.text === coalition_num) {
      const tr = select.parentElement?.parentElement
      const seats_elem = tr?.children[5]
      if (seats_elem) {
        total += parseInt((seats_elem as HTMLElement).innerText)
      }
    }
  }
  return total
}

export function set_coalition_seat(coalition_num: string, seats: number) {
  const table = document.getElementById('coalition-table')!;
  const tbody = table.children[0];
  const row = Array.from(tbody.children)
    .find(row => (row.children[0] as HTMLElement).innerText === coalition_num);
  if (row) {
      (row.children[1] as HTMLElement).innerText = seats.toString()
  }
}
