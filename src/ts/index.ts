
type byte       = number;  // 0 - 255
type deg        = number;  // degrees, [0.0 - 360.0]
type hund       = number;  // hund, [0.0 - 100.0]

type rgb_color = [byte, byte, byte];
type hsl_color = [deg,  hund, hund];





const hsluv_to_rgb = (husl: hsl_color): rgb_color => { throw 'todo'; };
const hpluv_to_rgb = (husl: hsl_color): rgb_color => { throw 'todo'; };

const rgb_to_hsluv = (rgb: rgb_color): hsl_color => { throw 'todo'; };
const rgb_to_hpluv = (rgb: rgb_color): hsl_color => { throw 'todo'; };





export {

  hsluv_to_rgb,
  hpluv_to_rgb,

  rgb_to_hsluv,
  rgb_to_hpluv

};
