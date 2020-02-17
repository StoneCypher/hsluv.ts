# hsluv-ts
An HSLuv implementation in typescript, ported from the [definitive reference
Haxe version](https://github.com/hsluv/hsluv).  [Math is accurate to within 1 in
10<sup>15</sup>](https://github.com/StoneCypher/hsluv-ts/blob/master/src/ts/hsluv.test.ts#L25).

[Library documentation](https://stonecypher.github.io/hsluv-ts/docs/)

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

![](comparison_image.png)



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
import { hsluv_to_rgb } from 'hsluv-ts';

console.log( hsluv_to_hex( [333, 50, 95] ) ); // '#'
```





<br/><br/>

## Changes

Names are now in `snake_case` instead of `camelCase`.  Every