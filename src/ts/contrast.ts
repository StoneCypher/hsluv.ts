
import { l_to_y, y_to_l } from './hsluv';





const W3C_CONTRAST_TEXT       = 4.5,
      W3C_CONTRAST_LARGE_TEXT = 3;





const contrast_ratio = (LighterL: number, DarkerL: number) =>

  (l_to_y(LighterL) + 0.05) / (l_to_y(DarkerL) + 0.05);





const lighter_min_l = (R: number): number =>

  y_to_l((R - 1) / 20);





const darker_max_l = (R: number, LighterL: number) =>

  y_to_l((20 * l_to_y(LighterL) - R + 1) / (20 * R));





export {

  contrast_ratio,

  lighter_min_l,
  darker_max_l

};
