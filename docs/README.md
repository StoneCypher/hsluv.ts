# hsluv-ts
An HSLuv implementation in typescript, ported from the [definitive reference
Haxe version](https://github.com/hsluv/hsluv).

[Library documentation](https://stonecypher.github.io/hsluv-ts/docs/)

<br/><br/>

## What is this?

Chances are you already know what `HSLuv` (formerly aka `HuSL`) is if you're
here, but if not, [`HSLuv` is a color scale meant to be easy for humans to
interpret](https://www.hsluv.org/).  This package actually implements two color
spaces: `HSLuv` and `HPLuv`.

What's interesting about `HSLuv` is that the apparent brightness is normalized.
If you've tried to pick color palettes in the regular `HSL` space, you've
probably noticed that at the same `lightness`, the colors in the blue end of the
`hue` appear far darker than the colors in the yellow end.

`HSLuv` fixes that.  For any given `hue`, the apparent brightness of a given
`lightness` is meant to be simiar (using a whole bunch of complicated math and
human measurement.)

From [Alexei's page](https://hsluv.org/comparison/),

![](comparison_image.png)





<br/><br/>

## How to use

```
npm install --save-dev hsluv-ts
```

```typescript
import { hsluv_to_rgb } from 'hsluv-ts';

console.log( hsluv_to_rgb() )
```





<br/><br/>

## Changes

Names are now in `snake_case` instead of `camelCase`.  Every