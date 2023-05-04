import { APPROVAL_METHODS, SCORE_METHODS, STRATEGIES, THIELE_METHODS } from "./constants"
import { get_strategy } from "./form"
import { CardinalStrategy, Method, PartyDiscipline, ReweightMethod } from "./types/wasm"

export function handle_strategy(method: string): void {
  const stv = toggle_strategy(method, 'stv-strategy', ['StvAustralia'])
  const a = toggle_strategy(method, 'approval-strategy', APPROVAL_METHODS)
  const score = toggle_strategy(method, 'score-strategy', SCORE_METHODS)
  const label = document.getElementById('strategy-label')!
  if (a || score || stv) {
    label.style.display = 'block'
  } else {
    label.style.display = 'none'
  }
}

// we need a three-state enum, otherwise we can't distinguish between
// "it was not set yet" and "it was set, but then discovered we need to ignore"
type TriState = 'unset' | 'ignore' | HTMLInputElement

function toggle_strategy(
  method: string,
  name: string,
  matches: Array<string>
): boolean {
  const elems =
    document.getElementsByClassName(name) as HTMLCollectionOf<HTMLElement>
  const has_match = matches.includes(method)
  const display = has_match ? 'contents' : 'none'
  // this function can either be triggered due to a change in method
  // or a change in strategy.
  // if the latter, we don't want to change the checked box,
  // which is what 'ignore' does
  let first: TriState = 'unset'
  for (const elem of elems) {
    elem.style.display = display
    const checkbox = elem.children[0] as HTMLInputElement
    if (first === 'unset') {
      first = checkbox as TriState
    } else if (first !== 'ignore' && checkbox.checked) {
      // another checkbox was set, do not change it
      first = 'ignore'
    }
  }
  if (first !== 'unset' && first !== 'ignore') {
    // check or uncheck the first checkbox,
    // depending on if we are showing or hiding
    first.checked = has_match
  }
  return has_match
}

export function parse_method(
  form: HTMLFormElement,
  method: string
): Method {
  if (APPROVAL_METHODS.includes(method) || SCORE_METHODS.includes(method)) {
    const s = get_strategy(form)!
    const alloc = THIELE_METHODS.includes(method)
      ? 'ScoreFromOriginal'
      : { WeightsFromPrevious: method as ReweightMethod }
    return { Cardinal: [STRATEGIES[s] as CardinalStrategy, alloc] }
  }
  if (method === 'StvAustralia') {
    const s = get_strategy(form)!
    return { StvAustralia: STRATEGIES[s] as PartyDiscipline }
  }
  return method as Method
}
