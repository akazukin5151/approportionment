import { CoalitionJSON } from "./types/cache"

export class Coalition {
  /** Mapping between coalition numbers and party numbers in that coalition */
  private coalitions: Map<number | null, Array<number>> = new Map()

  // Originally we maintained a second map between party numbers
  // and their coalition number for O(1) access, but this is one less invariant
  // to maintain at the expense of more clumsy code and O(n) search
  get_coalition_num(party_num: number): number | null {
    for (const { coalition_num, parties } of this.iter_coalitions()) {
      if (parties.includes(party_num)) {
        return coalition_num
      }
    }
    return null
  }

  get_parties(coalition_num: number | null): Array<number> | null {
    return this.coalitions.get(coalition_num) ?? null
  }

  add(party_num: number, coalition_num: number | null): void {
    const coalition = this.coalitions.get(coalition_num)
    if (coalition) {
      coalition.push(party_num)
    } else {
      this.coalitions.set(coalition_num, [party_num])
    }
  }

  modify(party_num: number, new_coalition_num: number | null): void {
    const current_coalition = this.find_coalition(party_num)
    if (current_coalition) {
      const idx = current_coalition.indexOf(party_num)
      if (idx > -1) {
        current_coalition.splice(idx, 1)
      }
    }

    const new_coalition = this.coalitions.get(new_coalition_num)
    if (new_coalition) {
      new_coalition.push(party_num)
    } else {
      this.coalitions.set(new_coalition_num, [party_num])
    }
  }

  private find_coalition(party_num: number): Array<number | null> | null {
    for (const { parties } of this.iter_coalitions()) {
      if (parties.includes(party_num)) {
        return parties
      }
    }
    return null
  }

  delete_coalition(coalition_number: number): void {
    const parties = this.coalitions.get(coalition_number)!
    const no_coalitions = this.coalitions.get(null)
    if (no_coalitions) {
      no_coalitions.push(...parties)
    } else {
      this.coalitions.set(null, parties)
    }
    this.coalitions.delete(coalition_number)
  }

  clear(): void {
    this.coalitions = new Map()
  }

  serialize(): Array<CoalitionJSON> {
    const r = []
    for (const { coalition_num, parties } of this.iter_coalitions()) {
      if (parties.length > 0) {
        r.push({ coalition_num, parties })
      }
    }
    return r
  }

  // This is a public function that duplicates iteration of the map,
  // to allow external code to iterate over it, but not modify it
  *iter_coalitions(): Generator<CoalitionJSON> {
    for (const [coalition_num, parties] of this.coalitions) {
      yield { coalition_num, parties }
    }
  }
}
