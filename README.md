# hsluv-ts
An HSLuv implementation in typescript, ported from the [definitive reference
Haxe version](https://github.com/hsluv/hsluv).  By comparison to the reference
implementation, [calculations are accurate to within 1 in 10<sup>15</sup>
](https://github.com/StoneCypher/hsluv-ts/blob/master/src/ts/hsluv.test.ts#L25).

[Generated library documentation](https://stonecypher.github.io/hsluv-ts/docs/)

<br/><br/>

## What is this?

Chances are you already know what `HSLuv` (formerly aka `HuSL`) is if you're
here, but if not, [`HSLuv` is a color scale meant to be easy for humans to
interpret](https://www.hsluv.org/).  This package primarily exists to implement
two color spaces: `HSLuv` and `HPLuv`.  However, in the process, we also
implement transformations for `rgb` in numeric, `rgb` in hex strings, `hsl`,
`xyz`, `luv`, and `lch`, as well as the `lightness` to `y channel` transform in
both directions.



<br/>

### HSLuv

What's interesting about `HSLuv` is that the apparent brightness is normalized.
If you've tried to pick color palettes in the regular `HSL` space, you've
probably noticed that at the same `lightness`, the colors in the blue end of the
`hue` appear far darker than the colors in the yellow end.

`HSLuv` fixes that.  For any given `hue`, the apparent brightness of a given
`lightness` is meant to be simiar (using a whole bunch of complicated math and
human measurement.)

From [Alexei's page](https://hsluv.org/comparison/),

<div style="display:inline-block;width:420px;">

![](comparison_image.png)

</div>



<br/>

### HPLuv

The downside of `HSLuv` is that there are colors it can't represent.  There is
no blue with the apparent brightness of canary yellow.

`HPLuv` makes these work by sacrificing saturation correctness.  `HPLuv` will
always produce a color, but sometimes a less satisfying one than `HSLuv`.





<br/><br/>

## How to use

```
npm install --save-dev hsluv-ts
```

```typescript
import { hsluv_to_hex, hsluv_to_rgb, hex_to_hsluv } from 'hsluv-ts';

console.log( hsluv_to_hex([ 250, 50, 50 ]) );
// prints "#5c78a5"

console.log( hsluv_to_rgb([ 250, 50, 50 ]) );
// prints [ 0.35957778969721066, 0.4708793745621595, 0.6462180065016022 ]

console.log( hex_to_hsluv('#5c78a5') );
// prints [ 250.2650513570262, 49.70313649414815, 50.00687151772391 ]
```





<br/><br/>

## API

The following functions are exposed.

All functions take two arguments, according to the types in their names.

* `rgb_to_hsluv`
* `rgb_to_hpluv`
* `hsluv_to_rgb`
* `hpluv_to_rgb`
* `hex_to_hsluv`
* `hex_to_hpluv`
* `hsluv_to_hex`
* `hpluv_to_hex`
* `lch_to_hsluv`
* `lch_to_hpluv`
* `hsluv_to_lch`
* `hpluv_to_lch`
* `rgb_to_xyz`
* `xyz_to_rgb`
* `rgb_to_lch`
* `lch_to_rgb`
* `luv_to_xyz`
* `xyz_to_luv`
* `luv_to_lch`
* `lch_to_luv`
* `l_to_y`
* `y_to_l`
* `hex_to_rgb`



<br/>

### API Types

* `l` and `y` are `number`s.
* `hex` is a seven-character `string` starting with `#`.
    * The library consumes upper and lower case, but produces lower case.
* `hsl` and `hpl` are a tuple (array) of range `[0;360]`, `[0;100]`, `[0;100]`
* `rgb` is a tuple of range `[0;1]`, `[0;1]`, `[0;1]`
* `xyz`, `lch`, and `luv` are a tuple of three unbounded signed `number`s





<br/><br/>

## Changes

Names are now in `snake_case` instead of `camelCase`.