import { add_party } from './index';
import { party_manager } from '../cache';
import { random_color } from '../random';
import { AllCanvases } from '../types/canvas';
import { XY } from '../types/position';

export function handle_random_point(
  point: XY,
  coalition_num: string,
  all_canvases: AllCanvases,
): void {
  const color = random_color()
  const num = party_manager.next_party_num()
  add_party(
    party_manager, point.x, point.y, color, num, all_canvases,
    parseInt(coalition_num)
  )
}
