
type point = { x: number, y: number };
type line  = { slope: number, intercept: number };
type angle = number;

type rgb   = [ number, number, number ];
type lch   = [ number, number, number ];
type luv   = [ number, number, number ];
type hsl   = [ number, number, number ];
type xyz   = [ number, number, number ];



type testentry = {

  lch   : lch,
  luv   : luv,
  xyz   : xyz,
  rgb   : rgb,
  hpluv : hsl,
  hsluv : hsl

};





type testdata = {
  [key: string]: testentry
};





export { point, line, angle, rgb, luv, hsl, xyz, lch, testdata };
