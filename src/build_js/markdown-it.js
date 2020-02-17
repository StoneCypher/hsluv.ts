
const fs = require('fs');



const hljs = require('highlight.js/lib/highlight.js');
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
hljs.registerLanguage('typescript', require('highlight.js/lib/languages/typescript'));



const mIt = require('markdown-it'),
      mUt = mIt().utils,

      md  = mIt({
        html        : true,
        linkify     : true,
        typographer : false,
        highlight   : (str, lang) => {

          if (lang && hljs.getLanguage(lang)) {
            try { return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`; }
            catch (__) {}
          }

          return `<pre class="hljs"><code>${mUt.escapeHtml(str)}</code></pre>`;

        }
      });



const out  = md.render( `${fs.readFileSync('./README.md')}` ),
      pre  = fs.readFileSync('./src/html/pre.html'),
      post = fs.readFileSync('./src/html/post.html');



console.log('building markdown to html...');

fs.writeFileSync('./docs/index.html', pre + out + post, 'utf-8');

console.log('  ... done.');
