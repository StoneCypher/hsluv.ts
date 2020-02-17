
import { data }                                from './testdata';
import { testdata, color, rgb, xyz, luv, lch } from './types';





import {

  hex_to_rgb,
  hex_to_hsluv,
  hex_to_hpluv,

  rgb_to_xyz,
  xyz_to_luv,
  luv_to_lch

} from './hsluv';





const tol = 0.0000000001;





function equalIsh([a, b, c]: color, [d, e, f]: color, tolerance: number): boolean {

  if ( Math.abs(a-d) > tolerance ) { return false; }
  if ( Math.abs(b-e) > tolerance ) { return false; }
  if ( Math.abs(c-f) > tolerance ) { return false; }

  return true;

}





function expEqualish(label: string, l: color, r: color, tolerance: number): void {

  const res: boolean = equalIsh( l, r, tolerance );

  test( label, () => expect( res? res : `${l}, ${r}` ).toBe(true) );

}





Object.keys(data).map( (key: string) => {

  const rr: rgb = hex_to_rgb(key),
        xx: xyz = rgb_to_xyz(rr),
        ll: luv = xyz_to_luv(xx),
        cc: lch = luv_to_lch(ll);

  test(`${key} to rgb`, () => expect( rr ).toStrictEqual(data[key].rgb) );

  expEqualish(`${key} to xyz`, xx, data[key].xyz, tol);
  expEqualish(`${key} to luv`, ll, data[key].luv, tol);
  expEqualish(`${key} to lch`, cc, data[key].lch, tol);

  expEqualish(`${key} to hpluv`, hex_to_hpluv(key), data[key].hpluv, tol);
  expEqualish(`${key} to hsluv`, hex_to_hsluv(key), data[key].hsluv, tol);

});
