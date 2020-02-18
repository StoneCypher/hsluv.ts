
// A typescript conversion of https://github.com/hsluv/hsluv/
// Generally the same code, but some names changed, and the packaging replaced
// s/haxe/typescript/g

// TODO update all doc text to typescript, markdown
// TODO == to ===
// TODO code simplification passes
// TODO enforce all "values are in" with exceptions
// TODO Std.int() becomes what, floor?
// TODO remove all assignment to arguments 😒





/*********
 *
 * # @stonecypher/hsluv.ts
 *
 * A `Human-friendly HSL` conversion utility class
 *
 * A typescript conversion of https://github.com/hsluv/hsluv/
 *
 * Generally the same code, but some names changed, and the packaging replaced
 *
 * `s/haxe/typescript/g`
 *
 * ----
 *
 * The math for most of this module was taken from:
 *
 * * http://www.easyrgb.com
 * * http://www.brucelindbloom.com
 * * Wikipedia
 *
 * All numbers below taken from math/bounds.wxm wxMaxima file. We use 17
 * digits of decimal precision to export the numbers, effectively exporting
 * them as double precision IEEE 754 floats.
 *
 * "If an IEEE 754 double precision is converted to a decimal string with at
 * least 17 significant digits and then converted back to double, then the
 * final number must match the original"
 *
 * Source: https://en.wikipedia.org/wiki/Double-precision_floating-point_format
 *
 **/

import { line, angle, color, hsl, hpl, xyz, rgb, lch, luv } from './types';

import {
  distance_line_from_origin,
  length_of_ray_until_intersect
} from './geometry';





const m = [

  [  3.240969941904521, -1.537383177570093, -0.498610760293    ],
  [ -0.96924363628087,   1.87596750150772,   0.041555057407175 ],
  [ 0.055630079696993,  -0.20397695888897,   1.056971514242878 ]

];


const minv = [

  [ 0.41239079926595,  0.35758433938387, 0.18048078840183 ],
  [ 0.21263900587151,  0.71516867876775, 0.072192315360733 ],
  [ 0.019330818715591, 0.11919477979462, 0.95053215224966  ]

];


const refY : number = 1.0,
      refU : number = 0.19783000664283,
      refV : number = 0.46831999493879;


const kappa   : number = 903.2962962,   // CIE LUV constants
      epsilon : number = 0.0088564516;


const hexChars : String = "0123456789abcdef";





/*********
 *
 * For a given lightness, return a list of 6 lines in slope-intercept
 * form that represent the bounds in CIELUV, stepping over which will
 * push a value out of the RGB gamut
 *
 **/

const get_bounds = (L: number): line[] => {

  let result: line[] = [];

  let sub1: number = Math.pow(L + 16, 3) / 1560896,
      sub2: number = (sub1 > epsilon)? sub1 : (L / kappa);

  [0,1,2].map(c => {

    let m1: number = m[c][0],
        m2: number = m[c][1],
        m3: number = m[c][2];

    [0,1,2].map(t => {

      let top1   : number = (284517 * m1 - 94839 * m3) * sub2,
          top2   : number = (838422 * m3 + 769860 * m2 + 731718 * m1) * L * sub2 - 769860 * t * L,
          bottom : number = (632260 * m3 - 126452 * m2) * sub2 + 126452 * t;

      result.push({
        slope     : top1 / bottom,
        intercept : top2 / bottom
      });

    });
  });

  return result;

};





/*********
 *
 * For given lightness, returns the maximum chroma. Keeping the chroma value
 * below this number will ensure that for any hue, the color is within the RGB
 * gamut.
 *
 **/

const max_safe_chroma_for_l = (L: number): number => {

  const bounds : line[] = get_bounds(L);
  let   min    : number = Number.POSITIVE_INFINITY;

  bounds.map(bound => {
    min = Math.min(min, distance_line_from_origin(bound));
  });

  return min;

}





const max_chroma_for_lh = (L: number, H: number): number => {

  const hrad   : number = H / 360 * Math.PI * 2,
        bounds : line[] = get_bounds(L);

  let min : number = Number.POSITIVE_INFINITY;

  bounds.map(bound => {
    const length : number = length_of_ray_until_intersect(hrad, bound);
    if (length >= 0) {
      min = Math.min(min, length);
    }
  });

  return min;

}





const dot_product = (a: number[], b: number[]): number =>

  a.reduce( (acc, cur, i) => acc += (cur * b[i]), 0 );





// Used for rgb conversions
const from_linear = (c: number): number =>

  (c <= 0.0031308)
    ? (12.92 * c)
    : (1.055 * Math.pow(c, 1 / 2.4) - 0.055);


const to_linear = (c: number): number =>

  (c > 0.04045)
    ? ( Math.pow((c + 0.055) / (1 + 0.055), 2.4) )
    : (c / 12.92);





/*********
 *
 * XYZ coordinates are ranging in [0;1] and RGB coordinates in [0;1] range.
 *
 * @param tuple An array containing the color's X,Y and Z values.
 * @return An array containing the resulting color's red, green and blue.
 *
 **/

const xyz_to_rgb = (tuple: xyz): rgb =>

  ([
    from_linear(dot_product(m[0], tuple)),
    from_linear(dot_product(m[1], tuple)),
    from_linear(dot_product(m[2], tuple))
  ]);





/*********
 *
 * RGB coordinates are ranging in [0;1] and XYZ coordinates in [0;1].
 *
 * @param tuple An array containing the color's R,G,B values.
 * @return An array containing the resulting color's XYZ coordinates.
 *
 **/

const rgb_to_xyz = (tuple: rgb): xyz => {

  const rgbl: rgb = [
    to_linear(tuple[0]),
    to_linear(tuple[1]),
    to_linear(tuple[2])
  ];

  return [
    dot_product(minv[0], rgbl),
    dot_product(minv[1], rgbl),
    dot_product(minv[2], rgbl)
  ];

}





/*********
 *
 * http://en.wikipedia.org/wiki/CIELUV
 *
 * In these formulas, Yn refers to the reference white point. We are using
 * illuminant D65, so Yn (see refY in Maxima file) equals 1. The formula is
 * simplified accordingly.
 *
 **/

const y_to_l = (Y: number): number =>

  (Y <= epsilon)

    ? (Y / refY) * kappa
    : ( 116 * Math.pow(Y / refY, 1.0 / 3.0) - 16 );


const l_to_y = (L: number): number =>

  (L <= 8)

    ? refY * L / kappa
    : ( refY * Math.pow((L + 16) / 116, 3) );





/*********
 *
 * XYZ coordinates are ranging in [0;1].
 *
 * @param tuple An array containing the color's X,Y,Z values.
 * @return An array containing the resulting color's LUV coordinates.
 *
 **/

const xyz_to_luv = (tuple: xyz): luv => {

  const X: number = tuple[0],
        Y: number = tuple[1],
        Z: number = tuple[2];

  // This divider fix avoids a crash on Python (divide by zero except.)
  // TODO FIXME this nan handling is nonsense
  let divider : number = (X + (15 * Y) + (3 * Z)),
      varU    : number = (divider === 0)? NaN : ((4 * X) / divider),
      varV    : number = (divider === 0)? NaN : ((9 * Y) / divider);

  const L: number = y_to_l(Y);

  if (L === 0) { return [0, 0, 0]; }

  const U: number = 13 * L * (varU - refU),
        V: number = 13 * L * (varV - refV);

  return [L, U, V];

}





/*********
 *
 * XYZ coordinates are ranging in `[0;1]`.
 *
 * @param tuple An array containing the color's L,U,V values.
 * @return An array containing the resulting color's XYZ coordinates.
 *
 **/

const luv_to_xyz = (tuple: luv): xyz => {

  // TODO FIXME these could be pattern matches
  const L: number = tuple[0];
  const U: number = tuple[1];
  const V: number = tuple[2];

  if (L === 0) { return [0, 0, 0]; }

  const varU: number = U / (13 * L) + refU;
  const varV: number = V / (13 * L) + refV;

  const Y: number = l_to_y(L);
  const X: number = 0 - (9 * Y * varU) / ((varU - 4) * varV - varU * varV);
  const Z: number = (9 * Y - (15 * varV * Y) - (varV * X)) / (3 * varV);

  return [X, Y, Z];
}





/*********
 *
 * @param tuple An array containing the color's L,U,V values.
 * @return An array containing the resulting color's LCH coordinates.
 *
 **/

const luv_to_lch = (tuple: luv): lch => {

  const L: number = tuple[0];
  const U: number = tuple[1];
  const V: number = tuple[2];

  const C: number = Math.sqrt(U * U + V * V);

  let H: number;

  // Greys: disambiguate hue
  if (C < 0.00000001) {
    H = 0;
  } else {
    const Hrad: number = Math.atan2(V, U);
    H = (Hrad * 180.0) / Math.PI;

    if (H < 0) { H = 360 + H; }
  }

  return [L, C, H];
}





/*********
 *
 * @param tuple An array containing the color's L,C,H values.
 * @return An array containing the resulting color's LUV coordinates.
 *
 **/

const lch_to_luv = (tuple: lch): luv => {

  // TODO match
  const L: number = tuple[0];
  const C: number = tuple[1];
  const H: number = tuple[2];

  const Hrad: number = H / 360.0 * 2 * Math.PI;
  const U: number = Math.cos(Hrad) * C;
  const V: number = Math.sin(Hrad) * C;

  return [L, U, V];

}





/*********
 *
 * HSLuv values are ranging in `[0;360]`, `[0;100]` and `[0;100]`.
 *
 * @param tuple An array containing the color's H,S,L values in HSLuv color space.
 * @return An array containing the resulting color's LCH coordinates.
 *
 **/

const hsluv_to_lch = (tuple: hsl): lch => {

  // TODO match
  const H: number = tuple[0];
  const S: number = tuple[1];
  const L: number = tuple[2];

  // White and black: disambiguate chroma
  if (L > 99.9999999) { return [100, 0, H]; }
  if (L < 0.00000001) { return [  0, 0, H]; }

  const max : number = max_chroma_for_lh(L, H);
  const C   : number = max / 100 * S;

  return [L, C, H];

}





/*********
 *
 * HSLuv values are ranging in [0;360], [0;100] and [0;100].
 *
 * @param tuple An array containing the color's LCH values.
 * @return An array containing the resulting color's HSL coordinates in HSLuv color space.
 *
 **/

const lch_to_hsluv = (tuple: lch): hsl => {

  // TODO match
  const L: number = tuple[0];
  const C: number = tuple[1];
  const H: number = tuple[2];

  // White and black: disambiguate chroma
  if (L > 99.9999999) { return [H, 0, 100]; }
  if (L < 0.00000001) { return [H, 0,   0]; }

  const max : number = max_chroma_for_lh(L, H);
  const S   : number = C / max * 100;

  return [H, S, L];

}





/*********
 *
 * HSLuv values are in `[0;360]`, `[0;100]` and `[0;100]`.
 *
 * @param tuple An array containing the color's H,S,L values in HPLuv (pastel variant) color space.
 * @return An array containing the resulting color's LCH coordinates.
 *
 **/

const hpluv_to_lch = (tuple: hpl): lch => {

  // TODO match
  const H: number = tuple[0];
  const S: number = tuple[1];
  const L: number = tuple[2];

  if (L > 99.9999999) { return [100, 0, H]; }
  if (L < 0.00000001) { return [  0, 0, H]; }

  const max : number = max_safe_chroma_for_l(L);
  const C   : number = max / 100 * S;

  return [L, C, H];

}





/*********
 *
 * HSLuv values are ranging in [0;360], [0;100] and [0;100].
 *
 * @param tuple An array containing the color's LCH values.
 * @return An array containing the resulting color's HSL coordinates in HPLuv (pastel variant) color space.
 *
 **/

const lch_to_hpluv = (tuple: lch): hpl => {

  // TODO match
  const L: number = tuple[0];
  const C: number = tuple[1];
  const H: number = tuple[2];

  // White and black: disambiguate saturation
  if (L > 99.9999999) { return [H, 0, 100]; }
  if (L < 0.00000001) { return [H, 0,   0]; }

  const max : number = max_safe_chroma_for_l(L);
  const S   : number = C / max * 100;

  return [H, S, L];

}





/*********
 *
 * RGB values are ranging in [0;1].
 *
 * @param tuple An array containing the color's RGB values.
 * @return A string containing a `#RRGGBB` representation of given color.
 *
 **/

const rgb_to_hex = (tuple: rgb): string => {

  let h: string = '#';

  [0,1,2].map(i => {

  // TODO FIXME isn't this just a radix print 😒

    const chan   : number = tuple[i];
    const c      : number = Math.round(chan * 255);
    const digit2 : number = c % 16;
    const digit1 : number = Math.floor((c - digit2) / 16);  // TODO CHECKME this was Std.int(), not 100% certain it's floor, maybe was round instead?

    h += hexChars.charAt(digit1) + hexChars.charAt(digit2);

  });

  return h;

}





/*********
 *
 * RGB values are ranging in [0;1].
 *
 * @param hex A `#RRGGBB` representation of a color.
 * @return An array containing the color's RGB values.
 *
 **/

const hex_to_rgb = (uhex: string): rgb => {

  const hex: string = uhex.toLowerCase();

  const ret: rgb = [0, 0, 0];

  [0,1,2].map(i => {

    const digit1 = hexChars.indexOf(hex.charAt(i * 2 + 1)),
          digit2 = hexChars.indexOf(hex.charAt(i * 2 + 2)),
          n      = digit1 * 16 + digit2;

    ret[i] = (n / 255.0);

  });

  return ret;

}





/*********
 *
 * RGB values are ranging in [0;1].
 *
 * @param tuple An array containing the color's LCH values.
 * @return An array containing the resulting color's RGB coordinates.
 *
 **/

const lch_to_rgb = (tuple: lch): rgb =>

  xyz_to_rgb(luv_to_xyz(lch_to_luv(tuple)));





/*********
 *
 * RGB values are ranging in [0;1].
 *
 * @param tuple An array containing the color's RGB values.
 * @return An array containing the resulting color's LCH coordinates.
 *
 **/

const rgb_to_lch = (tuple: rgb): lch =>

  luv_to_lch(xyz_to_luv(rgb_to_xyz(tuple)));





/*********
 *
 * HSLuv values are ranging in [0;360], [0;100] and [0;100] and RGB in [0;1].
 *
 * @param tuple An array containing the color's HSL values in HSLuv color space.
 * @return An array containing the resulting color's RGB coordinates.
 *
 **/

const hsluv_to_rgb = (tuple: hsl): rgb =>

  lch_to_rgb(hsluv_to_lch(tuple));





/*********
 *
 * HSLuv values are ranging in [0;360], [0;100] and [0;100] and RGB in [0;1].
 *
 * @param tuple An array containing the color's RGB coordinates.
 * @return An array containing the resulting color's HSL coordinates in HSLuv color space.
 *
 **/

const rgb_to_hsluv = (tuple: rgb): hsl =>

  lch_to_hsluv(rgb_to_lch(tuple));





/*********
 *
 * HSLuv values are ranging in [0;360], [0;100] and [0;100] and RGB in [0;1].
 *
 * @param tuple An array containing the color's HSL values in HPLuv (pastel variant) color space.
 * @return An array containing the resulting color's RGB coordinates.
 *
 **/

const hpluv_to_rgb = (tuple: hpl): rgb =>

  lch_to_rgb(hpluv_to_lch(tuple));





/*********
 *
 * HSLuv values are ranging in [0;360], [0;100] and [0;100] and RGB in [0;1].
 *
 * @param tuple An array containing the color's RGB coordinates.
 * @return An array containing the resulting color's HSL coordinates in HPLuv (pastel variant) color space.
 *
 **/

const rgb_to_hpluv = (tuple: rgb): hpl =>

  lch_to_hpluv(rgb_to_lch(tuple));





/*********
 *
 * HSLuv values are ranging in [0;360], [0;100] and [0;100] and RGB in [0;1].
 *
 * @param tuple An array containing the color's HSL values in HSLuv color space.
 * @return A string containing a `#RRGGBB` representation of given color.
 *
 **/

const hsluv_to_hex = (tuple: hsl): string =>

  rgb_to_hex(hsluv_to_rgb(tuple));





const hpluv_to_hex = (tuple: hpl): string =>

  rgb_to_hex(hpluv_to_rgb(tuple));





/*********
 *
 * HSLuv values are ranging in [0;360], [0;100] and [0;100] and RGB in [0;1].
 *
 * @param tuple An array containing the color's HSL values in HPLuv (pastel variant) color space.
 * @return An array containing the color's HSL values in HSLuv color space.
 *
 **/

const hex_to_hsluv = (s: string): hsl =>

  rgb_to_hsluv(hex_to_rgb(s));





/*********
 *
 * HSLuv values are ranging in [0;360], [0;100] and [0;100] and RGB in [0;1].
 *
 * @param hex A `#RRGGBB` representation of a color.
 * @return An array containing the color's HSL values in HPLuv (pastel variant) color space.
 *
 **/

const hex_to_hpluv = (s: string): hpl =>

  rgb_to_hpluv(hex_to_rgb(s));





export {

  rgb_to_hsluv,
  rgb_to_hpluv,

  hsluv_to_rgb,
  hpluv_to_rgb,

  hex_to_hsluv,
  hex_to_hpluv,

  hsluv_to_hex,
  hpluv_to_hex,

  lch_to_hsluv,
  lch_to_hpluv,

  hsluv_to_lch,
  hpluv_to_lch,

  rgb_to_xyz,
  xyz_to_rgb,

  rgb_to_lch,
  lch_to_rgb,

  luv_to_xyz,
  xyz_to_luv,

  luv_to_lch,
  lch_to_luv,

  l_to_y,
  y_to_l,

  hex_to_rgb

};
