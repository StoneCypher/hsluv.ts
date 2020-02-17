
import { data }     from './testdata';
import { testdata } from './types';

import {

  hex_to_rgb,
  hex_to_hsluv,
  hex_to_hpluv

} from './hsluv';

Object.keys(data).map( (key: string) => {

  // test(`${key} to lch`, () => expect( hex_to_lch(key) ).toStrictEqual(data[key].hsluv) );
  // test(`${key} to luv`, () => expect( hex_to_luv(key) ).toStrictEqual(data[key].hsluv) );
  // test(`${key} to hsluv`, () => expect( hex_to_hsluv(key) ).toStrictEqual(data[key].hsluv) );
  // test(`${key} to hsluv`, () => expect( hex_to_hsluv(key) ).toStrictEqual(data[key].hsluv) );

  test(`${key} to rgb`, () => expect( hex_to_rgb(key) ).toStrictEqual(data[key].rgb) );
  // test(`${key} to hpluv`, () => expect( hex_to_hpluv(key) ).toStrictEqual(data[key].hpluv) );
  // test(`${key} to hsluv`, () => expect( hex_to_hsluv(key) ).toStrictEqual(data[key].hsluv) );

});
