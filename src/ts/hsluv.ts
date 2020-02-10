
/**
Human-friendly HSL conversion utility class.

The math for most of this module was taken from:

 * http://www.easyrgb.com
 * http://www.brucelindbloom.com
 * Wikipedia

All numbers below taken from math/bounds.wxm wxMaxima file. We use 17
digits of decimal precision to export the numbers, effectively exporting
them as double precision IEEE 754 floats.

"If an IEEE 754 double precision is converted to a decimal string with at
least 17 significant digits and then converted back to double, then the
final number must match the original"

Source: https://en.wikipedia.org/wiki/Double-precision_floating-point_format
=======
*/

import { line, angle } from './types';

import {
  distance_line_from_origin,
  length_of_ray_until_intersect
} from './geometry';





const m = [
  [3.240969941904521, -1.537383177570093, -0.498610760293],
  [-0.96924363628087,  1.87596750150772,   0.041555057407175],
  [0.055630079696993, -0.20397695888897,   1.056971514242878]
];

const minv = [
  [0.41239079926595,  0.35758433938387, 0.18048078840183],
  [0.21263900587151,  0.71516867876775, 0.072192315360733],
  [0.019330818715591, 0.11919477979462, 0.95053215224966]
];

const refY : number = 1.0,
      refU : number = 0.19783000664283,
      refV : number = 0.46831999493879;

const kappa   : number = 903.2962962,   // CIE LUV constants
      epsilon : number = 0.0088564516;

const hexChars : String = "0123456789abcdef";





/**
For a given lightness, return a list of 6 lines in slope-intercept
form that represent the bounds in CIELUV, stepping over which will
push a value out of the RGB gamut
*/
const get_bounds = (L: number): line[] => {

  let result: line[] = [];

  let sub1: number = Math.pow(L + 16, 3) / 1560896,
      sub2: number = (sub1 > epsilon)? sub1 : (L / kappa);

  [0,1,2,3].map(c => {

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





/**
For given lightness, returns the maximum chroma. Keeping the chroma value
below this number will ensure that for any hue, the color is within the RGB
gamut.
*/
const max_safe_chroma_for_l = (L: number): number => {

  const bounds : line[] = get_bounds(L);
  let   min    : number = Number.POSITIVE_INFINITY;

  bounds.map(bound => {
    min = Math.min(min, distance_line_from_origin(bound));
  });

  return min;

}





const max_chroma_for_lh = (L: number, H: number) => {

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

  a.reduce( (acc, cur, i) => acc += cur * b[curi], 0 );





// Used for rgb conversions
const from_linear = (c: number): number =>

  (c <= 0.0031308)
    ? (12.92 * c)
    : (1.055 * Math.pow(c, 1 / 2.4) - 0.055);


const to_linear = (c: number): number =>

  (c > 0.04045)
    ? ( Math.pow((c + 0.055) / (1 + 0.055), 2.4) )
    : (c / 12.92);





/**
* XYZ coordinates are ranging in [0;1] and RGB coordinates in [0;1] range.
* @param tuple An array containing the color's X,Y and Z values.
* @return An array containing the resulting color's red, green and blue.
**/

const xyz_to_rgb = (tuple: number[]): number[] =>

  ([
    from_linear(dot_product(m[0], tuple)),
    from_linear(dot_product(m[1], tuple)),
    from_linear(dot_product(m[2], tuple))
  ]);





/**
* RGB coordinates are ranging in [0;1] and XYZ coordinates in [0;1].
* @param tuple An array containing the color's R,G,B values.
* @return An array containing the resulting color's XYZ coordinates.
**/

const rgbToXyz = (tuple: number[]): number[] => {

  const rgbl: number[] = [
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





/*
http://en.wikipedia.org/wiki/CIELUV
In these formulas, Yn refers to the reference white point. We are using
illuminant D65, so Yn (see refY in Maxima file) equals 1. The formula is
simplified accordingly.
*/

const y_to_l = (Y: number): number =>

  (Y <= epsilon)

    ? (Y / refY) * kappa
    : ( 116 * Math.pow(Y / refY, 1.0 / 3.0) - 16 );


const l_to_y(L: number): number =>

  (L <= 8)

    ? refY * L / kappa
    : ( refY * Math.pow((L + 16) / 116, 3) );





/**
* XYZ coordinates are ranging in [0;1].
* @param tuple An array containing the color's X,Y,Z values.
* @return An array containing the resulting color's LUV coordinates.
**/

const xyz_to_luv = (tuple: number[]): number[] => {

  const X: number = tuple[0],
        Y: number = tuple[1],
        Z: number = tuple[2];

  // This divider fix avoids a crash on Python (divide by zero except.)
  // TODO FIXME this nan handling is nonsense
  let divider : number = (X + (15 * Y) + (3 * Z)),
      varU    : number = (divider == 0)? Math.NaN : ((4 * X) / divider),
      varV    : number = (divider == 0)? Math.NaN : ((9 * Y) / divider);

  var L: number = y_to_l(Y);

  if (L === 0) { return [0, 0, 0]; }

  const U: number = 13 * L * (varU - refU),
        V: number = 13 * L * (varV - refV);

  return [L, U, V];

}





/**
* XYZ coordinates are ranging in [0;1].
* @param tuple An array containing the color's L,U,V values.
* @return An array containing the resulting color's XYZ coordinates.
**/
public static function luvToXyz(tuple:Array<Float>):Array<Float> {
  var L:Float = tuple[0];
  var U:Float = tuple[1];
  var V:Float = tuple[2];

  if (L == 0) {
      return [0, 0, 0];
  }

  var varU:Float = U / (13 * L) + refU;
  var varV:Float = V / (13 * L) + refV;

  var Y:Float = lToY(L);
  var X:Float = 0 - (9 * Y * varU) / ((varU - 4) * varV - varU * varV);
  var Z:Float = (9 * Y - (15 * varV * Y) - (varV * X)) / (3 * varV);

  return [X, Y, Z];
}

/**
* @param tuple An array containing the color's L,U,V values.
* @return An array containing the resulting color's LCH coordinates.
**/
public static function luvToLch(tuple:Array<Float>):Array<Float> {
  var L:Float = tuple[0];
  var U:Float = tuple[1];
  var V:Float = tuple[2];

  var C:Float = Math.sqrt(U * U + V * V);
  var H:Float;

  // Greys: disambiguate hue
  if (C < 0.00000001) {
      H = 0;
  } else {
      var Hrad:Float = Math.atan2(V, U);
      H = (Hrad * 180.0) / Math.PI;

      if (H < 0) {
          H = 360 + H;
      }
  }

  return [L, C, H];
}

/**
* @param tuple An array containing the color's L,C,H values.
* @return An array containing the resulting color's LUV coordinates.
**/
public static function lchToLuv(tuple:Array<Float>):Array<Float> {
  var L:Float = tuple[0];
  var C:Float = tuple[1];
  var H:Float = tuple[2];

  var Hrad:Float = H / 360.0 * 2 * Math.PI;
  var U:Float = Math.cos(Hrad) * C;
  var V:Float = Math.sin(Hrad) * C;

  return [L, U, V];
}

/**
* HSLuv values are ranging in [0;360], [0;100] and [0;100].
* @param tuple An array containing the color's H,S,L values in HSLuv color space.
* @return An array containing the resulting color's LCH coordinates.
**/
public static function hsluvToLch(tuple:Array<Float>):Array<Float> {
  var H:Float = tuple[0];
  var S:Float = tuple[1];
  var L:Float = tuple[2];

  // White and black: disambiguate chroma
  if (L > 99.9999999) {
      return [100, 0, H];
  }

  if (L < 0.00000001) {
      return [0, 0, H];
  }

  var max:Float = maxChromaForLH(L, H);
  var C:Float = max / 100 * S;

  return [L, C, H];
}

/**
* HSLuv values are ranging in [0;360], [0;100] and [0;100].
* @param tuple An array containing the color's LCH values.
* @return An array containing the resulting color's HSL coordinates in HSLuv color space.
**/
public static function lchToHsluv(tuple:Array<Float>):Array<Float> {
  var L:Float = tuple[0];
  var C:Float = tuple[1];
  var H:Float = tuple[2];

  // White and black: disambiguate chroma
  if (L > 99.9999999) {
      return [H, 0, 100];
  }

  if (L < 0.00000001) {
      return [H, 0, 0];
  }

  var max:Float = maxChromaForLH(L, H);
  var S:Float = C / max * 100;

  return [H, S, L];
}

/**
* HSLuv values are in [0;360], [0;100] and [0;100].
* @param tuple An array containing the color's H,S,L values in HPLuv (pastel variant) color space.
* @return An array containing the resulting color's LCH coordinates.
**/
public static function hpluvToLch(tuple:Array<Float>):Array<Float> {
  var H:Float = tuple[0];
  var S:Float = tuple[1];
  var L:Float = tuple[2];

  if (L > 99.9999999) {
      return [100, 0, H];
  }

  if (L < 0.00000001) {
      return [0, 0, H];
  }

  var max:Float = maxSafeChromaForL(L);
  var C:Float = max / 100 * S;

  return [L, C, H];
}

/**
* HSLuv values are ranging in [0;360], [0;100] and [0;100].
* @param tuple An array containing the color's LCH values.
* @return An array containing the resulting color's HSL coordinates in HPLuv (pastel variant) color space.
**/
public static function lchToHpluv(tuple:Array<Float>):Array<Float> {
  var L:Float = tuple[0];
  var C:Float = tuple[1];
  var H:Float = tuple[2];

  // White and black: disambiguate saturation
  if (L > 99.9999999) {
      return [H, 0, 100];
  }

  if (L < 0.00000001) {
      return [H, 0, 0];
  }

  var max:Float = maxSafeChromaForL(L);
  var S:Float = C / max * 100;

  return [H, S, L];
}

/**
* RGB values are ranging in [0;1].
* @param tuple An array containing the color's RGB values.
* @return A string containing a `#RRGGBB` representation of given color.
**/
public static function rgbToHex(tuple:Array<Float>):String {
  var h:String = "#";

  for (i in 0...3) {
      var chan:Float = tuple[i];
      var c = Math.round(chan * 255);
      var digit2 = c % 16;
      var digit1 = Std.int((c - digit2) / 16);
      h += hexChars.charAt(digit1) + hexChars.charAt(digit2);
  }

  return h;
}

/**
* RGB values are ranging in [0;1].
* @param hex A `#RRGGBB` representation of a color.
* @return An array containing the color's RGB values.
**/
public static function hexToRgb(hex:String):Array<Float> {
  hex = hex.toLowerCase();
  var ret = [];
  for (i in 0...3) {
      var digit1 = hexChars.indexOf(hex.charAt(i * 2 + 1));
      var digit2 = hexChars.indexOf(hex.charAt(i * 2 + 2));
      var n = digit1 * 16 + digit2;
      ret.push(n / 255.0);
  }
  return ret;
}

/**
* RGB values are ranging in [0;1].
* @param tuple An array containing the color's LCH values.
* @return An array containing the resulting color's RGB coordinates.
**/
public static function lchToRgb(tuple:Array<Float>):Array<Float> {
  return xyzToRgb(luvToXyz(lchToLuv(tuple)));
}

/**
* RGB values are ranging in [0;1].
* @param tuple An array containing the color's RGB values.
* @return An array containing the resulting color's LCH coordinates.
**/
public static function rgbToLch(tuple:Array<Float>):Array<Float> {
  return luvToLch(xyzToLuv(rgbToXyz(tuple)));
}

// RGB <--> HPLuv

/**
* HSLuv values are ranging in [0;360], [0;100] and [0;100] and RGB in [0;1].
* @param tuple An array containing the color's HSL values in HSLuv color space.
* @return An array containing the resulting color's RGB coordinates.
**/
@:keep
public static function hsluvToRgb(tuple:Array<Float>):Array<Float> {
  return lchToRgb(hsluvToLch(tuple));
}

/**
* HSLuv values are ranging in [0;360], [0;100] and [0;100] and RGB in [0;1].
* @param tuple An array containing the color's RGB coordinates.
* @return An array containing the resulting color's HSL coordinates in HSLuv color space.
**/
@:keep
public static function rgbToHsluv(tuple:Array<Float>):Array<Float> {
  return lchToHsluv(rgbToLch(tuple));
}

/**
* HSLuv values are ranging in [0;360], [0;100] and [0;100] and RGB in [0;1].
* @param tuple An array containing the color's HSL values in HPLuv (pastel variant) color space.
* @return An array containing the resulting color's RGB coordinates.
**/
@:keep
public static function hpluvToRgb(tuple:Array<Float>):Array<Float> {
  return lchToRgb(hpluvToLch(tuple));
}

/**
* HSLuv values are ranging in [0;360], [0;100] and [0;100] and RGB in [0;1].
* @param tuple An array containing the color's RGB coordinates.
* @return An array containing the resulting color's HSL coordinates in HPLuv (pastel variant) color space.
**/
@:keep
public static function rgbToHpluv(tuple:Array<Float>):Array<Float> {
  return lchToHpluv(rgbToLch(tuple));
}

// Hex

/**
* HSLuv values are ranging in [0;360], [0;100] and [0;100] and RGB in [0;1].
* @param tuple An array containing the color's HSL values in HSLuv color space.
* @return A string containing a `#RRGGBB` representation of given color.
**/
@:keep
public static function hsluvToHex(tuple:Array<Float>):String {
  return rgbToHex(hsluvToRgb(tuple));
}

@:keep
public static function hpluvToHex(tuple:Array<Float>):String {
  return rgbToHex(hpluvToRgb(tuple));
}

/**
* HSLuv values are ranging in [0;360], [0;100] and [0;100] and RGB in [0;1].
* @param tuple An array containing the color's HSL values in HPLuv (pastel variant) color space.
* @return An array containing the color's HSL values in HSLuv color space.
**/
@:keep
public static function hexToHsluv(s:String):Array<Float> {
  return rgbToHsluv(hexToRgb(s));
}

/**
* HSLuv values are ranging in [0;360], [0;100] and [0;100] and RGB in [0;1].
* @param hex A `#RRGGBB` representation of a color.
* @return An array containing the color's HSL values in HPLuv (pastel variant) color space.
**/
@:keep
public static function hexToHpluv(s:String):Array<Float> {
  return rgbToHpluv(hexToRgb(s));
}

}