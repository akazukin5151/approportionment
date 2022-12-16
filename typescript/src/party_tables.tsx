import * as elements from 'typed-html';
import { DEFAULT_PARTIES } from './utils';

export function setup_party_buttons() {
  const table = document.getElementById('party_table')
  if (!table) { return }
  const tbody = table.getElementsByTagName("tbody")[0];

  add_default_parties(tbody);

  const btn = document.getElementById('add_party_button')
  btn?.addEventListener("click", () => {
    const row = document.createElement('tr')
    row.innerHTML = <tr>
      <td><input type="checkbox" /></td>
      <td>1</td>
      <td><input type="color" /></td>
      <td>1</td>
      <td>1</td>
    </tr>;
    tbody.appendChild(row)
  })
}

function add_default_parties(tbody: HTMLTableSectionElement) {
  DEFAULT_PARTIES.forEach((party, idx) => {
    const row = document.createElement('tr')
    row.innerHTML = <tr>
      <td><input type="radio" name="party" class="party_radio" /></td>
      <td>{idx}</td>
      <td><input type="color" value={party.color} /></td>
      <td>{party.x}</td>
      <td>{party.y}</td>
    </tr>;
    tbody.appendChild(row)
  })
  // first row is the header
  const row = tbody.children[3];
  const d = row.children[0];
  const radio = d.children[0] as HTMLInputElement;
  radio.checked = true;
}
