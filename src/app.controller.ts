import { Controller, Get } from '@nestjs/common';

import * as mjAPI from 'mathjax-node';
import * as mjpage from 'mathjax-node-page';

mjAPI.config({
  MathJax: {
    // traditional MathJax configuration
  },
});
mjAPI.start();

@Controller()
export class AppController {
  @Get('ping')
  root() {
    return '0k';
  }

  @Get('mathjax')
  async mathjax() {
    const yourMath = 'E = mc^2';

    const result = await mjAPI.typeset({
      math: yourMath,
      format: 'TeX', // or "inline-TeX", "MathML"
      html: true, // or svg:true, or html:true
    });

    return result.html;
  }

  @Get('page')
  async page() {
    const input = `
  \\[ f(x) = \\int_{-\\infty}^{\\infty} e^{-\\pi x^2} \\, dx \\]
  `;

    try {
      return await this.renderMath(input);
    } catch (error) {
      console.error('Math rendering failed:', error);
    }
  }

  async renderMath(input) {
    return new Promise((resolve, reject) => {
      const mjpageConfig = {
        format: ['TeX'], // determines type of pre-processors to run
        output: 'html', // global override for output option; 'svg', 'html' or 'mml'
        tex: {}, // configuration options for tex pre-processor, cf. lib/tex.js
        ascii: {}, // configuration options for ascii pre-processor, cf. lib/ascii.js
        singleDollars: false, // allow single-dollar delimiter for inline TeX
        fragment: false, // return body.innerHTML instead of full document
        cssInline: true, // determines whether inline css should be added
        jsdom: {
          // NOTE these are not straight jsdom configuration options (cf. below)
          // NOT used when passing jsdom object to mjpage()
          runScripts: 'dangerously', // set to "dangerously" to execute scripts from the HTML source
          virtualConsole: true,
        },
        displayMessages: false, // determines whether Message.Set() calls are logged
        displayErrors: false, // determines whether error messages are shown on the console
        undefinedCharError: false, // determines whether unknown characters are saved in the error array
        extensions: '', // a convenience option to add MathJax extensions
        fontURL:
          'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/fonts/HTML-CSS', // for webfont urls in the CSS for HTML output
        MathJax: {}, // options MathJax configuration, see https://docs.mathjax.org
        // errorHandler: (id, wrapperNode, sourceFormula, sourceFormat, errors) => {...} // function to handle rendering error
      };
      const mjnodeConfig = {
        ex: 6, // ex-size in pixels
        width: 100, // width of math container (in ex) for linebreaking and tags
        useFontCache: true, // use <defs> and <use> in svg output?
        useGlobalCache: false, // use common <defs> for all equations?
        // state: mjstate, // track global state
        linebreaks: false, // do linebreaking?
        equationNumbers: 'none', // or "AMS" or "all"
        math: '', // the math to typeset
        html: false, // generate HTML output?
        css: false, // generate CSS for HTML output?
        mml: false, // generate mml output?
        svg: false, // generate svg output?
        speakText: true, // add spoken annotations to output?
        timeout: 10 * 1000, // 10 second timeout before restarting MathJax
      };

      mjpage.addOutput('html', (wrapper, data) => {
        wrapper.innerHTML = `<div class='ABC'>
  ${data}
</div>`;
      });

      mjpage
        .mjpage(input, mjpageConfig, mjnodeConfig, function (output) {
          if (output.errors) {
            reject(output.errors);
          } else {
            resolve(output);
          }
        })
        .on('afterConversion', function (parsedFormula) {
          // manipulate parsed result and DOM at your will
          // see description of parsedFormula object above
          console.log('parsedFormula', parsedFormula);
        });
    });
  }
}
