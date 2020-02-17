
const cjs_config = {

  input     : 'dist/es6/hsluv.js',

  output    : {
    file      : 'dist/es6/hsluv.bundle.cjs.js',
    format    : 'cjs',
    name      : 'hsluv'
  }

};





const iife_config = {

  input     : 'dist/es6/hsluv.js',

  output    : {
    file      : 'dist/es6/hsluv.bundle.iife.js',
    format    : 'iife',
    name      : 'hsluv'
  }

};





export default [ cjs_config, iife_config ];
