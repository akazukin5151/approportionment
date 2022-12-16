import { DEFAULT_PARTIES } from './constants';

export function setup_party_buttons() {
  const table = document.getElementById('party_table')
  if (!table) { return }
  const tbody = table.getElementsByTagName("tbody")[0];

  add_default_parties(tbody);

  const btn = document.getElementById('add_party_button')
  btn?.addEventListener("click", () => {
    const row = document.createElement('tr')

    const input = document.createElement('input')
    input.setAttribute('type', "checkbox")
    const td1 = document.createElement('td')
    td1.appendChild(input)
    row.appendChild(td1)

    const td2 = document.createElement('td')
    td2.appendChild(document.createTextNode("1"))
    row.appendChild(td2)

    const color = document.createElement('input')
    color.setAttribute('type', "color")
    const td3 = document.createElement('td')
    td3.appendChild(color)
    row.appendChild(td3)

    const td4 = document.createElement('td')
    td4.appendChild(document.createTextNode("1"))
    row.appendChild(td4)

    const td5 = document.createElement('td')
    td5.appendChild(document.createTextNode("1"))
    row.appendChild(td5)

    const delete_btn = document.createElement('button')
    delete_btn.innerText = 'Delete'
    delete_btn.onclick = delete_party
    row.appendChild(delete_btn)

    tbody.appendChild(row)
  })
}

function add_default_parties(tbody: HTMLTableSectionElement) {
  DEFAULT_PARTIES.forEach((party, idx) => {
    const row = document.createElement('tr')

    const input = document.createElement('input')
    input.setAttribute('type', "radio")
    input.name = "party"
    input.setAttribute('class', "party_radio")
    if (idx === 2) {
      input.checked = true
    }
    row.appendChild(document.createElement('td').appendChild(input))

    const td1 = document.createElement('td')
    td1.appendChild(document.createTextNode(idx.toString()))
    row.appendChild(td1)

    const color = document.createElement('input')
    color.setAttribute('type', "color")
    color.value = party.color
    const td2 = document.createElement('td')
    td2.appendChild(color)
    row.appendChild(td2)

    const td3 = document.createElement('td')
    td3.appendChild(document.createTextNode(party.x.toString()))
    row.appendChild(td3)

    const td4 = document.createElement('td')
    td4.appendChild(document.createTextNode(party.y.toString()))
    row.appendChild(td4)

    const delete_btn = document.createElement('button')
    delete_btn.innerText = 'Delete'
    delete_btn.onclick = delete_party
    row.appendChild(delete_btn)
    tbody.appendChild(row)
  })
}

function delete_party(ev: MouseEvent) {
  const e = ev.target
  if (e) {
    const parent = (e as Element).parentNode as Element
    const color_picker = parent.children[2].children[0] as HTMLInputElement
    const color = color_picker.value
    const elems = document.getElementsByClassName('party-circle');
    Array.from(elems).forEach(e => {
      if (e.getAttribute('fill')?.toLowerCase() === color.toLowerCase()) {
        e.remove()
      }
    })
    parent.remove()
  }
}
