
import { l_to_y, y_to_l } from './hsluv';





const W3C_CONTRAST_TEXT       = 4.5,
      W3C_CONTRAST_LARGE_TEXT = 3;





const contrast_ratio = (lighterL, darkerL) =>

  (l_to_y(lighterL) + 0.05) / (l_to_y(darkerL) + 0.05);





const lighter_min_l = (r: number): number =>

  y_to_l((r - 1) / 20);





const darker_max_l = (r: number, lighterL: number) =>

  y_to_l((20 * l_to_y(lighterL) - r + 1) / (20 * r));





export {

  contrast_ratio,

  lighter_min_l,
  darker_max_l

};
