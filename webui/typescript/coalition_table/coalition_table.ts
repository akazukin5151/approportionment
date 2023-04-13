import { coalitions_from_table } from "../form";

export function calculate_coalition_seats(coalition_num: string): number {
  let total = 0
  const selects = document.getElementsByClassName('select-coalition')!;
  for (const select of selects) {
    const coalition = (select as HTMLSelectElement).selectedOptions[0]
    if (coalition!.text === coalition_num) {
      const tr = select.parentElement?.parentElement
      const seats_elem = tr?.children[4]
      if (seats_elem) {
        total += parseInt((seats_elem as HTMLElement).innerText)
      }
    }
  }
  return total
}

export function set_coalition_seat(coalition_num: string, seats: number): void {
  // const row = coalitions_from_table()
  //   .find(row => (row.children[0] as HTMLElement).innerText === coalition_num);
  // if (row) {
  //     (row.children[1] as HTMLElement).innerText = seats.toString()
  // }
}

